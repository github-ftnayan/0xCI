"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Repo = { id: number; name: string; full_name: string; private: boolean };
type Step = "loading" | "pick-repo" | "aws-setup" | "nameservers" | "done" | "error";

const CFN_TEMPLATE_URL = "https://0xci-templates.s3.amazonaws.com/oidc-role.yml";

function cfnLaunchUrl(owner: string, domain: string) {
  const params = new URLSearchParams({
    templateURL: CFN_TEMPLATE_URL,
    stackName: "0xci-oidc",
    param_GitHubOrg: owner,
    param_GitHubRepo: "*",
    ...(domain ? { param_DomainName: domain } : {}),
  });
  return `https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?${params}`;
}

function SetupWizard() {
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installation_id");

  const [step, setStep] = useState<Step>("loading");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [accountId, setAccountId] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [injecting, setInjecting] = useState(false);
  const [roleArn, setRoleArn] = useState("");
  const [doneRepos, setDoneRepos] = useState<string[]>([]);

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
        setSelected(new Set(data.repos.map((r: Repo) => r.id)));
        setStep("pick-repo");
      })
      .catch(() => {
        setError("Network error. Please try again.");
        setStep("error");
      });
  }, [installationId]);

  function toggleRepo(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedRepos = repos.filter((r) => selected.has(r.id));
  const firstOwner = selectedRepos[0]?.full_name.split("/")[0] ?? "";

  async function handleInject() {
    if (!selectedRepos.length || accountId.length !== 12 || injecting) return;
    setInjecting(true);
    setError("");

    try {
      const res = await fetch("/api/setup/inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repos: selectedRepos.map((r) => {
            const [owner, repo] = r.full_name.split("/");
            return { owner, repo };
          }),
          accountId,
          region,
          domain: domain.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Failed to inject secrets. Please try again.");
        return;
      }

      if (data.failed?.length) {
        setError(
          `Failed for: ${data.failed.map((f: { repo: string }) => f.repo).join(", ")}. Check app permissions.`
        );
      }

      setRoleArn(data.roleArn);
      setDoneRepos(selectedRepos.map((r) => r.full_name));
      setStep(domain.trim() ? "nameservers" : "done");
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
            {(["pick-repo", "aws-setup", ...(domain.trim() ? ["nameservers"] : []), "done"] as Step[]).map((s, i, arr) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-6 bg-[#00ff88]"
                    : step === "done" || i < arr.indexOf(step)
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

        {/* Step 1: Pick repos */}
        {step === "pick-repo" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-1">Select repositories</h1>
              <p className="text-[#8888A8] text-sm">
                Choose which repos to enable preview deployments for.
              </p>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {repos.map((r) => {
                const isSelected = selected.has(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRepo(r.id)}
                    className={`flex items-center gap-3 border rounded-lg px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-[#00ff88]/[0.05] border-[#00ff88]/40"
                        : "bg-[#1A1A24] border-[#2A2A38] hover:border-[#00ff88]/20"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-[#00ff88] border-[#00ff88]" : "border-[#4A4A58]"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#0A0A0F] text-[12px]">
                          check
                        </span>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[#8888A8] text-lg shrink-0">
                      {r.private ? "lock" : "folder_open"}
                    </span>
                    <span className="font-mono text-sm text-[#F0F0F8] truncate">{r.full_name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8888A8] text-xs">
                {selected.size} of {repos.length} selected
              </span>
              <button
                onClick={() => setStep("aws-setup")}
                disabled={selected.size === 0}
                className="inline-flex items-center gap-2 bg-[#00ff88] text-[#0A0A0F] font-bold px-5 py-2.5 rounded-md hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Continue
                <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AWS setup */}
        {step === "aws-setup" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-1">Connect your AWS account</h1>
              <p className="text-[#8888A8] text-sm">
                Enabling previews for{" "}
                <span className="font-mono text-[#F0F0F8]">
                  {selected.size} repo{selected.size !== 1 ? "s" : ""}
                </span>
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
                Creates an IAM role in your AWS account that GitHub Actions can assume via OIDC.
                No long-lived keys stored anywhere.
              </p>
              <a
                href={cfnLaunchUrl(firstOwner, domain)}
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
                Found in the top-right corner of the AWS console — 12 digits, no hyphens.
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
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="font-mono bg-[#0A0A0F] border border-[#2A2A38] focus:border-[#00ff88]/50 rounded-md px-4 py-2.5 text-[#F0F0F8] text-sm outline-none transition-colors w-full"
              >
                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                <option value="us-west-2">us-west-2 (Oregon)</option>
                <option value="eu-west-1">eu-west-1 (Ireland)</option>
                <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
                <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                <option value="ap-northeast-1">ap-northeast-1 (Tokyo)</option>
              </select>
              <input
                type="text"
                placeholder="myapp.com (optional — for production deploys)"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                className="font-mono bg-[#0A0A0F] border border-[#2A2A38] focus:border-[#00ff88]/50 rounded-md px-4 py-2.5 text-[#F0F0F8] text-sm outline-none transition-colors placeholder:text-[#8888A8]/30 w-full"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleInject}
                disabled={accountId.length !== 12 || !region || injecting}
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
              ← Change selection
            </button>
          </div>
        )}

        {/* Step 3: Nameservers (domain only) */}
        {step === "nameservers" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-1">Set your nameservers</h1>
              <p className="text-[#8888A8] text-sm">
                A Route 53 hosted zone was created for{" "}
                <span className="font-mono text-[#F0F0F8]">{domain}</span>. Copy the 4 nameservers from your CloudFormation stack and set them at your domain registrar.
              </p>
            </div>

            <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00ff88] text-lg">dns</span>
                <span className="text-[#F0F0F8] text-sm font-medium">Where to find your nameservers</span>
              </div>
              <ol className="flex flex-col gap-2 text-[#8888A8] text-xs leading-relaxed list-decimal list-inside">
                <li>Open the CloudFormation console and go to your <span className="font-mono text-[#F0F0F8]">0xci-oidc</span> stack</li>
                <li>Click the <span className="font-mono text-[#F0F0F8]">Outputs</span> tab</li>
                <li>Copy the 4 values from <span className="font-mono text-[#F0F0F8]">NameServers</span></li>
                <li>Go to your domain registrar and replace the nameservers with these 4 values</li>
              </ol>
              <a
                href="https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00ff88] text-sm font-mono hover:underline w-fit"
              >
                Open CloudFormation
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-xl p-4 text-xs text-[#8888A8] leading-relaxed">
              DNS propagation usually takes 5–60 minutes. Once done, merging to main will deploy to <span className="font-mono text-[#F0F0F8]">{domain}</span> automatically.
            </div>

            <button
              onClick={() => setStep("done")}
              className="inline-flex items-center gap-2 bg-[#00ff88] text-[#0A0A0F] font-bold px-5 py-2.5 rounded-md hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-all text-sm w-fit"
            >
              I&apos;ve updated my nameservers
              <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="flex flex-col gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#00ff88] text-3xl">check_circle</span>
            </div>
            <div>
              <h1 className="text-[#F0F0F8] font-bold text-xl mb-2">You&apos;re all set</h1>
              <p className="text-[#8888A8] text-sm leading-relaxed">
                {doneRepos.length === 1
                  ? `${doneRepos[0]} is connected.`
                  : `${doneRepos.length} repositories connected.`}{" "}
                Open a pull request and 0xCI will deploy a live preview automatically.
              </p>
            </div>
            <div className="bg-[#1A1A24] border border-[#2A2A38] rounded-lg p-4 text-left flex flex-col gap-2">
              <p className="font-mono text-[10px] text-[#8888A8] tracking-widest uppercase">
                Connected repos
              </p>
              {doneRepos.map((r) => (
                <p key={r} className="font-mono text-xs text-[#00ff88]">{r}</p>
              ))}
              <p className="font-mono text-[10px] text-[#8888A8] tracking-widest uppercase mt-2">
                AWS Role ARN
              </p>
              <p className="font-mono text-xs text-[#00ff88] break-all">{roleArn}</p>
            </div>
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
