import type { Metadata } from "next";
import { Navbar } from "../../components/Navbar";

export const metadata: Metadata = {
  title: "Changelog - 0xCI",
  description: "Release notes and updates for 0xCI.",
  alternates: { canonical: "/changelog" },
};

const ENTRIES = [
  {
    version: "v0.5",
    date: "2026-07-04",
    tag: "Latest",
    changes: [
      { type: "feat", text: "Open Graph and Twitter card metadata, plus a dynamically generated preview image, for rich link previews" },
      { type: "feat", text: "Security headers (HSTS, CSP, X-Frame-Options, and more) added to every response" },
      { type: "feat", text: "sitemap.xml, robots.txt, canonical URLs, and JSON-LD structured data for search and AI answer engines" },
      { type: "feat", text: "llms.txt with a short product summary for AI agents" },
      { type: "feat", text: "New /privacy page describing exactly what data 0xCI handles" },
      { type: "feat", text: "Copy as Markdown button on the docs page" },
      { type: "feat", text: "Home link added to the nav" },
      { type: "fix", text: "Fixed several accessibility issues found by an automated scan: color contrast, missing labels on icon-only links, duplicate landmark regions, and an empty table header" },
      { type: "fix", text: "Enlarged small tap targets across the nav, footer, and docs sidebar for mobile" },
      { type: "fix", text: "Footer links now point to real pages instead of placeholders" },
    ],
  },
  {
    version: "v0.4",
    date: "2026-07-02",
    tag: null,
    changes: [
      { type: "feat", text: "Production deploys with custom domain — merge to main deploys to your domain via Route 53 + ACM automatically" },
      { type: "feat", text: "Route 53 hosted zone provisioned automatically via CloudFormation — no manual DNS setup required" },
      { type: "feat", text: "AWS region selection in setup wizard — deploy to any AWS region" },
      { type: "feat", text: "AWS_REGION secret injected alongside AWS_ROLE_ARN during setup" },
      { type: "fix", text: "Teardown workflow no longer blocks deploy workflow — separate concurrency groups" },
      { type: "fix", text: "Setup PR skipped by deploy workflow — no false failure on 0xci/setup branch" },
      { type: "fix", text: "SST app name sanitized for repos starting with digits (e.g. 0xCI → app-0xci)" },
    ],
  },
  {
    version: "v0.3",
    date: "2026-07-01",
    tag: null,
    changes: [
      { type: "feat", text: "Multi-repo select wizard — enable preview deployments for multiple repos at once" },
      { type: "feat", text: "Probot pushes workflows directly to default branch — no PR merge required" },
      { type: "feat", text: "Lambda webhook replaces Fly.io — free, serverless, AWS-native" },
      { type: "feat", text: "Handles repos added to existing installation via installation_repositories.added event" },
      { type: "fix", text: "OAuth callback 500 error on fresh install resolved" },
    ],
  },
  {
    version: "v0.2",
    date: "2026-06-30",
    tag: null,
    changes: [
      { type: "feat", text: "Setup wizard with GitHub OAuth and AWS secret injection" },
      { type: "feat", text: "CloudFormation template for OIDC role — no long-lived AWS credentials" },
      { type: "feat", text: "PR preview URL posted as comment by Probot bot" },
      { type: "feat", text: "Teardown workflow destroys preview environment on PR close" },
      { type: "feat", text: "Auto-detects Next.js, SvelteKit, and static sites" },
    ],
  },
  {
    version: "v0.1",
    date: "2026-06-28",
    tag: null,
    changes: [
      { type: "feat", text: "Initial release — zero-config GitHub App for PR preview deployments on AWS" },
      { type: "feat", text: "SST v4 infrastructure with OpenNext for Next.js support" },
      { type: "feat", text: "Probot app injects deployment workflows via setup PR" },
    ],
  },
];

const TAG_COLORS: Record<string, string> = {
  feat: "text-[#00ff88] bg-[#00ff88]/10",
  fix: "text-blue-400 bg-blue-400/10",
  break: "text-red-400 bg-red-400/10",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="font-mono text-[11px] text-[#00ff88] tracking-[0.2em] uppercase mb-3">Changelog</p>
          <h1 className="text-3xl font-bold text-[#F0F0F8] tracking-tight mb-4">What's new</h1>
          <p className="text-[#8888A8] text-sm leading-relaxed">
            All notable changes to 0xCI, newest first.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {ENTRIES.map((entry) => (
            <div key={entry.version} className="flex gap-6">
              {/* Timeline */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] shrink-0" />
                <div className="w-px flex-1 bg-[#2A2A38]" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono font-bold text-[#F0F0F8]">{entry.version}</span>
                  {entry.tag && (
                    <span className="font-mono text-[10px] text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded tracking-widest uppercase">
                      {entry.tag}
                    </span>
                  )}
                  <span className="font-mono text-xs text-[#8888A8]">{entry.date}</span>
                </div>

                <ul className="flex flex-col gap-2">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded tracking-widest uppercase shrink-0 mt-0.5 ${TAG_COLORS[change.type] ?? "text-[#8888A8] bg-[#2A2A38]"}`}>
                        {change.type}
                      </span>
                      <span className="text-[#8888A8] text-sm leading-relaxed">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
