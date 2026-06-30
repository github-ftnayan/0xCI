"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Repo = { id: number; name: string; full_name: string; private: boolean };
type Step = "loading" | "pick-repo" | "aws-setup" | "done" | "error";

const CFN_TEMPLATE_URL =
  "https://0xci-templates.s3.amazonaws.com/oidc-role.yml";

function cfnLaunchUrl(owner: string, repo: string) {
  const params = new URLSearchParams({
    templateURL: CFN_TEMPLATE_URL,
    stackName: "hexci-oidc",
    param_GitHubOrg: owner,
    param_GitHubRepo: repo,
  });
  return `https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?${params}`;
}

function SetupWizard() {
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installation_id");

  const [step, setStep] = useState<Step>("loading");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");
  const [injecting, setInjecting] = useState(false);
  const [roleArn, setRoleArn] = useState("");

  useEffect(() => {
    if (!installationId) {
      setError("No installation ID found. Please reinstall the GitHub App.");
      setStep("error");
      return;
    }

    fetch(`/api/setup/repos?installation_id=${installationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(
            data.error === "not_authenticated"
              ? "Session expired. Please reinstall the GitHub App."
              : "Failed to load repositories."
          );
          setStep("error");
          return;
        }
        setRepos(data.repos);
        setStep("pick-repo");
      })
      .catch(() => {
        setError("Network error. Please try again.");
        setStep("error");
      });
  }, [installationId]);

  async function handleInject() {
    if (!selectedRepo || accountId.length !== 12 || injecting) return;
    setInjecting(true);
    setError("");

    const [owner, repo] = selectedRepo.full_name.split("/");

    try {
      const res = await fetch("/api/setup/inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, accountId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error === "failed_to_get_public_key"
          ? "Could not access repo secrets. Make sure 0xCI has the right permissions."
          : "Failed to inject secret. Please try again.");
        return;
      }

      setRoleArn(data.roleArn);
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setInjecting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-12">
          <a href="/" className="inline-block font-mono text-2xl">
            <span className="text-[#00ff88] font-bold">0x</span>
            <span className="text-[#F0F0F8] font-light">CI</span>
          </a>
        </div>

        {/* Progress dots */}
        {step !== "error" && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {(["pick-repo", "aws-setup", "done"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-6 bg-[#00ff88]"
                    : step === "done" || (i < ["pick-repo", "aws-setup", "done"].indexOf(step))
                    ? "w-3 bg-[#00ff88]/40"
                    : "w-3 bg-[#2A2A38]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#8888A8] text-sm font-mono">Loading your repositories...</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-red-400 text-3xl mb-3 block">error</span>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <a href="/" className="text-[#00ff88] text-sm font-mono hover:underline">
              ← Back to home
            </a>
          </div>
        )}

        {/* Step 1: Pick repo */}
        {step === "pick-repo" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-1">Pick a repository</h1>
              <p className="text-[#8888A8] text-sm">
                Choose which repo to enable preview deployments for.
              </p>
            </div>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {repos.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRepo(r); setStep("aws-setup"); }}
                  className="flex items-center gap-3 bg-[#1A1A24] border border-[#2A2A38] hover:border-[#00ff88]/40 hover:bg-[#00ff88]/[0.03] rounded-lg px-4 py-3 text-left transition-colors group"
                >
                  <span className="material-symbols-outlined text-[#8888A8] group-hover:text-[#00ff88] text-lg transition-colors shrink-0">
                    {r.private ? "lock" : "folder_open"}
                  </span>
                  <span className="font-mono text-sm text-[#F0F0F8] truncate">{r.full_name}</span>
                  <span className="material-symbols-outlined text-[#2A2A38] group-hover:text-[#00ff88]/40 text-lg transition-colors ml-auto shrink-0">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: AWS setup */}
        {step === "aws-setup" && selectedRepo && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-1">Connect your AWS account</h1>
              <p className="text-[#8888A8] text-sm">
                Setting up{" "}
                <span className="font-mono text-[#F0F0F8]">{selectedRepo.full_name}</span>
              </p>
            </div>

            {/* Step 1: Launch CFN */}
            <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded tracking-widest uppercase">
                  Step 1
                </span>
                <span className="text-[#F0F0F8] text-sm font-medium">Deploy the OIDC role</span>
              </div>
              <p className="text-[#8888A8] text-xs leading-relaxed">
                This creates an IAM role in your AWS account that GitHub Actions can assume via
                OIDC. No long-lived keys are stored anywhere.
              </p>
              <a
                href={cfnLaunchUrl(...(selectedRepo.full_name.split("/") as [string, string]))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#00ff88] text-[#0A0A0F] font-bold px-4 py-2.5 rounded-md hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-all text-sm w-fit"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">rocket_launch</span>
                Launch CloudFormation Stack
              </a>
            </div>

            {/* Step 2: Account ID */}
            <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded tracking-widest uppercase">
                  Step 2
                </span>
                <span className="text-[#F0F0F8] text-sm font-medium">Enter your AWS Account ID</span>
              </div>
              <p className="text-[#8888A8] text-xs leading-relaxed">
                Found in the top-right corner of the AWS console — 12 digits, no hyphens. We use
                it to construct your role ARN and inject it as a repo secret automatically.
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="123456789012"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                className="font-mono bg-[#0A0A0F] border border-[#2A2A38] focus:border-[#00ff88]/50 rounded-md px-4 py-2.5 text-[#F0F0F8] text-sm outline-none transition-colors placeholder:text-[#8888A8]/30 w-full"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleInject}
                disabled={accountId.length !== 12 || injecting}
                className="inline-flex items-center gap-2 bg-[#00ff88] text-[#0A0A0F] font-bold px-4 py-2.5 rounded-md hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none w-fit"
              >
                {injecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] leading-none">link</span>
                    Connect AWS
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => { setStep("pick-repo"); setError(""); }}
              className="text-[#8888A8] text-xs font-mono hover:text-[#F0F0F8] transition-colors text-left"
            >
              ← Change repository
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && selectedRepo && (
          <div className="flex flex-col gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#00ff88] text-3xl">check_circle</span>
            </div>
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-2">You&apos;re all set</h1>
              <p className="text-[#8888A8] text-sm leading-relaxed">
                <span className="font-mono text-[#F0F0F8]">{selectedRepo.full_name}</span> is
                connected. Open a pull request and 0xCI will deploy a live preview automatically.
              </p>
            </div>
            <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-lg p-4 text-left">
              <p className="font-mono text-[10px] text-[#8888A8] mb-1 tracking-widest uppercase">
                AWS Role ARN (injected as secret)
              </p>
              <p className="font-mono text-xs text-[#00ff88] break-all">{roleArn}</p>
            </div>
            <a
              href={`https://github.com/${selectedRepo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#00ff88] text-[#0A0A0F] font-bold px-6 py-3 rounded-md hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-all"
            >
              Open repository
              <span className="material-symbols-outlined text-[18px] leading-none">arrow_forward</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin" />
        </div>
      }
    >
      <SetupWizard />
    </Suspense>
  );
}
