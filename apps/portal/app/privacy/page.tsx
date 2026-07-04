import type { Metadata } from "next";
import { Navbar } from "../../components/Navbar";

export const metadata: Metadata = {
  title: "Privacy - 0xCI",
  description:
    "How 0xCI handles data: no analytics, no database, no AWS credentials ever touch our servers.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "No analytics or tracking",
    body: "The 0xCI website and GitHub App run no analytics, advertising, or tracking scripts of any kind. We don't know who visits this site or how you use it.",
  },
  {
    title: "One functional cookie",
    body: "When you use the setup wizard, we set a single short-lived (1 hour), httpOnly cookie holding your GitHub OAuth token. It's used only to call GitHub's API on your behalf while you connect a repository, and it isn't used for tracking. It expires automatically and is never written to a database, since we don't have one.",
  },
  {
    title: "No database",
    body: "0xCI has no database. When the GitHub App processes a webhook (a pull request, a workflow run), it reads what it needs from the event payload (repo and org names, PR numbers, commit and workflow-run IDs) to trigger a deploy and post a status comment on your PR. None of it is stored; it's used in memory for that single event and discarded.",
  },
  {
    title: "AWS credentials never touch our servers",
    body: "0xCI uses OpenID Connect (OIDC). AWS trusts short-lived tokens issued directly by GitHub Actions for your specific repository, and that trust relationship never passes through 0xCI's infrastructure. The only AWS-related value our servers ever see is your account's role ARN (not a secret), plus a region and optional domain name, which the setup wizard writes as encrypted secrets directly into your own GitHub repository using GitHub's secrets API.",
  },
  {
    title: "Domain availability lookups",
    body: "If you use the domain finder on the homepage, the domain name you type is sent to the relevant public domain registry (RDAP) to check availability. No other data accompanies that request.",
  },
  {
    title: "Questions",
    body: "0xCI is open source. If you have a question about how something works, open an issue on GitHub; that's our only support channel.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Navbar />
      <div className="flex-grow max-w-3xl mx-auto w-full px-6 pt-28 pb-24 flex flex-col gap-16">
        <div>
          <p className="font-mono text-[11px] text-[#00ff88] tracking-[0.2em] uppercase mb-3">
            Privacy
          </p>
          <h1 className="text-3xl font-bold text-[#F0F0F8] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#8888A8] leading-relaxed">
            0xCI is a small, open-source project. This page describes exactly
            what data we handle and why, no more and no less.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h2 className="text-[#F0F0F8] font-semibold">
                {section.title}
              </h2>
              <p className="text-[#8888A8] text-sm leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[#8888A8]/60 text-xs font-mono">
          Source code:{" "}
          <a
            href="https://github.com/github-ftnayan/0xCI"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00ff88] transition-colors"
          >
            github.com/github-ftnayan/0xCI
          </a>
        </p>
      </div>
    </div>
  );
}
