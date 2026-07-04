import type { Metadata } from "next";
import { Navbar } from "../../components/Navbar";
import { CopyMarkdownButton } from "../../components/CopyMarkdownButton";

export const metadata: Metadata = {
  title: "Docs - 0xCI",
  description:
    "Get started with 0xCI: install the GitHub App, connect your AWS account via OIDC, and get a live preview URL on every pull request.",
  alternates: { canonical: "/docs" },
};

const SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: [
      {
        heading: "Prerequisites",
        body: `You need an AWS account and a GitHub repository. That's it. No CLI tools, no config files, no infrastructure knowledge required.`,
      },
      {
        heading: "1. Install the GitHub App",
        body: `Go to the 0xCI GitHub App page and click Install. Select the repositories you want to enable preview deployments for. GitHub will redirect you to the setup wizard automatically.`,
      },
      {
        heading: "2. Connect your AWS account",
        body: `In the setup wizard, select your repositories, choose your AWS region, and enter your 12-digit AWS Account ID. Click "Launch CloudFormation Stack" — this creates an IAM role in your account that GitHub Actions can assume via OIDC. No long-lived credentials are ever stored.`,
      },
      {
        heading: "3. Open a pull request",
        body: `That's it. Open any PR in a connected repository and 0xCI will deploy a live preview environment automatically. The URL is posted as a comment on the PR. When the PR is closed or merged, the environment is destroyed.`,
      },
    ],
  },
  {
    id: "how-it-works",
    title: "How It Works",
    content: [
      {
        heading: "OIDC authentication",
        body: `0xCI never stores AWS credentials. Instead, it uses OpenID Connect (OIDC) — GitHub Actions obtains a short-lived token from GitHub's OIDC provider and exchanges it for temporary AWS credentials. The IAM role created by CloudFormation only trusts tokens from your specific GitHub org.`,
      },
      {
        heading: "Preview environments",
        body: `Each pull request gets its own isolated AWS environment deployed to a unique stage (e.g. pr-42). SST auto-detects your framework (Next.js, SvelteKit, or static) and deploys accordingly. The preview URL is a CloudFront distribution — globally cached, HTTPS by default.`,
      },
      {
        heading: "Teardown",
        body: `When a PR is closed or merged, the teardown workflow runs automatically and removes all AWS resources for that stage. You only pay for what's running.`,
      },
      {
        heading: "Production deploys",
        body: `When you merge to main, the same workflow deploys to your production stage with your custom domain (if configured). SST handles SSL certificate provisioning and DNS automatically via Route 53.`,
      },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    content: [
      {
        heading: "GitHub Secrets",
        body: `0xCI injects two secrets into your repository during setup:\n\n• AWS_ROLE_ARN — the ARN of the IAM role to assume\n• AWS_REGION — the AWS region to deploy to\n• DOMAIN_NAME — your production domain (if configured)`,
      },
      {
        heading: "sst.config.ts",
        body: `0xCI injects an sst.config.ts into your repository that auto-detects your framework. For PR stages it deploys without a domain. For the production stage it wires up your custom domain via Route 53. You can customize this file after setup.`,
      },
      {
        heading: "Supported frameworks",
        body: `0xCI auto-detects:\n\n• Next.js — deployed via OpenNext on Lambda + CloudFront\n• SvelteKit — deployed on Lambda + CloudFront\n• Static sites — deployed to S3 + CloudFront`,
      },
    ],
  },
  {
    id: "custom-domain",
    title: "Custom Domain",
    content: [
      {
        heading: "Requirements",
        body: `Your domain must have a hosted zone in Route 53 in your AWS account. If your domain is registered elsewhere (Namecheap, GoDaddy, etc.), you need to update the nameservers to the ones Route 53 gives you — a one-time 5-minute step.`,
      },
      {
        heading: "Setup",
        body: `During the setup wizard, enter your domain name. 0xCI will create a Route 53 hosted zone automatically via CloudFormation and show you the 4 nameservers to set at your registrar. Once DNS propagates (usually under an hour), production deploys will go live on your domain.`,
      },
      {
        heading: "SSL",
        body: `SSL certificates are provisioned automatically via AWS Certificate Manager (ACM) at no cost. No manual certificate management needed.`,
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    content: [
      {
        heading: "Does 0xCI store my AWS credentials?",
        body: `Never. 0xCI uses OIDC — GitHub Actions obtains temporary credentials at runtime. No secrets are stored on 0xCI's servers.`,
      },
      {
        heading: "What does it cost?",
        body: `0xCI itself is free. You pay only for the AWS resources it provisions in your account. For typical usage (a few preview environments at a time), this is well within the AWS free tier — often under $1/month.`,
      },
      {
        heading: "What if I already have a sst.config.ts?",
        body: `0xCI checks before injecting. If a deploy.yml already exists on your default branch, it skips injection entirely. If you have a custom sst.config.ts, 0xCI won't overwrite it — you may need to merge the changes manually.`,
      },
      {
        heading: "Can I add more repositories later?",
        body: `Yes. Go to your GitHub App settings, add the new repository, and you'll be redirected to the setup wizard to connect it to your AWS account.`,
      },
      {
        heading: "Which AWS regions are supported?",
        body: `All standard AWS regions. Choose whichever is closest to your users. The CloudFormation stack for OIDC must be deployed in us-east-1, but your application can deploy to any region.`,
      },
    ],
  },
];

const DOCS_INTRO =
  "Everything you need to deploy preview environments and production apps on your own AWS account.";

function buildFaqSchema() {
  const faqSection = SECTIONS.find((s) => s.id === "faq");
  if (!faqSection) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSection.content.map((item) => ({
      "@type": "Question",
      name: item.heading,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.body,
      },
    })),
  };
}

function buildHowToSchema() {
  const gettingStarted = SECTIONS.find((s) => s.id === "getting-started");
  if (!gettingStarted) return null;
  const steps = gettingStarted.content.filter((item) =>
    /^\d+\./.test(item.heading),
  );
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to deploy AWS preview URLs for pull requests with 0xCI",
    description: DOCS_INTRO,
    step: steps.map((item) => ({
      "@type": "HowToStep",
      name: item.heading.replace(/^\d+\.\s*/, ""),
      text: item.body,
    })),
  };
}

function docsToMarkdown(): string {
  const lines: string[] = ["# 0xCI Docs", "", DOCS_INTRO, ""];
  for (const section of SECTIONS) {
    lines.push(`## ${section.title}`, "");
    for (const item of section.content) {
      lines.push(`### ${item.heading}`, "", item.body, "");
    }
  }
  return lines.join("\n");
}

export default function DocsPage() {
  const markdown = docsToMarkdown();
  const faqSchema = buildFaqSchema();
  const howToSchema = buildHowToSchema();

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <Navbar />
      <div className="flex-grow max-w-5xl mx-auto w-full px-6 pt-28 pb-24 flex gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-1 w-48 shrink-0 sticky top-28 self-start">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-sm text-[#8888A8] hover:text-[#F0F0F8] transition-colors py-3 font-mono"
            >
              {s.title}
            </a>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col gap-16 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-[11px] text-[#00ff88] tracking-[0.2em] uppercase mb-3">Documentation</p>
              <h1 className="text-3xl font-bold text-[#F0F0F8] tracking-tight mb-4">0xCI Docs</h1>
              <p className="text-[#8888A8] leading-relaxed">{DOCS_INTRO}</p>
            </div>
            <CopyMarkdownButton markdown={markdown} />
          </div>

          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="flex flex-col gap-8">
              <h2 className="text-xl font-bold text-[#F0F0F8] border-b border-[#2A2A38] pb-3">
                {section.title}
              </h2>
              {section.content.map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <h3 className="text-[#F0F0F8] font-semibold">{item.heading}</h3>
                  <p className="text-[#8888A8] text-sm leading-relaxed whitespace-pre-line">{item.body}</p>
                </div>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
