import { Navbar } from "../components/Navbar";
import { TerminalAnimation } from "../components/TerminalAnimation";
import { DomainFinder } from "../components/DomainFinder";

const STEPS = [
  {
    icon: "download",
    title: "Install",
    body: "Add the 0xCI GitHub App to your repository with a single click. No complex configuration files needed.",
  },
  {
    icon: "shield",
    title: "Connect AWS",
    body: "Securely link your AWS account using OIDC. We provision isolated preview environments automatically.",
  },
  {
    icon: "rocket_launch",
    title: "Ship",
    body: "Open a PR and get a live preview URL instantly. Merge with confidence, without the infrastructure headache.",
  },
];

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="-translate-y-px">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col pt-16">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="flex flex-col items-center text-center gap-stack-lg max-w-4xl mx-auto px-container-margin pt-24 pb-16 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/5">
            <span className="font-mono text-[11px] text-[#00ff88] tracking-[0.15em] uppercase">
              Open Source · Built on SST v4 · GitHub Actions
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-display-lg text-display-lg text-[#F0F0F8] tracking-tight">
            Deploy to AWS.{" "}
            <br className="hidden sm:block" />
            <span className="text-[#8888A8] font-light">Skip the bill shock.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-[#8888A8] max-w-2xl leading-relaxed">
            0xCI is a zero-config GitHub App that gives every pull request its own live
            preview URL — built on your own AWS account.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-stack-md mt-4 w-full sm:w-auto">
            <a
              href="https://github.com/apps/0xci-hexci/installations/new"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00ff88] text-[#0A0A0F] font-bold px-6 py-3 rounded-md hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2"
            >
              Install GitHub App
              <span className="material-symbols-outlined text-[18px] leading-none">arrow_forward</span>
            </a>
            <a
              href="https://github.com/github-ftnayan/0xCI"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#2A2A38] text-[#F0F0F8] bg-transparent px-6 py-3 rounded-md hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <GitHubIcon />
              View on GitHub
            </a>
          </div>

          {/* Terminal animation */}
          <TerminalAnimation />
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="py-24 px-container-margin">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <h2 className="font-headline-md text-headline-md text-[#F0F0F8] text-center tracking-tight">
              How it works
            </h2>

            {/* Desktop layout: circular icons + connecting dashes */}
            <div className="hidden md:grid grid-cols-3 gap-8 relative">
              <div className="absolute top-12 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-[#2A2A38]/40 z-0" />
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4 z-10">
                  <div className="w-24 h-24 rounded-full border border-[#2A2A38] bg-[#1A1A24] flex items-center justify-center transition-all hover:border-[#00ff88]/50 hover:bg-[#00ff88]/[0.06] hover:shadow-[0_0_24px_rgba(0,255,136,0.12)]">
                    <span className="material-symbols-outlined text-4xl text-[#00ff88]">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm">
                    <span className="font-mono text-[#00ff88]">{i + 1}.</span>{" "}
                    {step.title}
                  </h3>
                  <p className="text-[#8888A8] font-body-md text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile layout: cards with large number watermarks */}
            <div className="grid md:hidden grid-cols-1 gap-4">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="relative bg-[#1A1A24] border border-[#2A2A38] p-6 rounded-xl overflow-hidden hover:border-[#00ff88]/40 transition-colors group"
                >
                  <div className="absolute -right-3 -top-3 text-[120px] font-bold text-[#1f1f25] select-none leading-none z-0">
                    {i + 1}
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-[#1f1f25] rounded-lg flex items-center justify-center mb-4 border border-[#2A2A38] group-hover:border-[#00ff88]/40 transition-colors">
                      <span className="material-symbols-outlined text-[#00ff88]">
                        {step.icon}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-[#F0F0F8] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#8888A8] text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Domain Finder ────────────────────────────────────── */}
        <DomainFinder />

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="py-24 px-container-margin text-center">
          <p className="font-mono text-[11px] text-[#00ff88] tracking-[0.2em] uppercase mb-4">
            Get Started
          </p>
          <h2 className="font-headline-md text-headline-md text-[#F0F0F8] mb-4">
            Ready to ship?
          </h2>
          <p className="text-[#8888A8] font-body-md mb-8 max-w-md mx-auto">
            Five minutes from now, every PR in your repo will have its own live AWS preview.
          </p>
          <a
            href="https://github.com/apps/0xci-hexci/installations/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#00ff88] text-[#0A0A0F] font-bold px-8 py-4 rounded-md hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all text-lg"
          >
            Install GitHub App
            <span className="material-symbols-outlined text-[20px] leading-none">arrow_forward</span>
          </a>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="bg-[#0e0e13] w-full px-container-margin flex flex-col md:flex-row justify-between items-center gap-gutter border-t border-[#2A2A38] py-8 mb-16 md:mb-0">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-mono text-lg">
              <span className="text-[#00ff88] font-bold">0x</span>
              <span className="font-light text-[#F0F0F8]">CI</span>
            </span>
            <span className="font-mono text-[10px] text-[#8888A8]">
              Built by{" "}
              <a
                href="https://github.com/github-ftnayan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00ff88] transition-colors"
              >
                @github-ftnayan
              </a>
              . © 2026 0xCI
            </span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Documentation", href: "#" },
              { label: "GitHub", href: "https://github.com/github-ftnayan/0xCI" },
              { label: "Status", href: "#" },
              { label: "Privacy", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="font-mono text-[11px] text-[#8888A8] hover:text-[#00ff88] transition-colors"
              >
                {label}
              </a>
            ))}
            <span className="font-mono text-[11px] text-[#8888A8] ml-2 border-l border-[#2A2A38] pl-4 opacity-50">
              MIT Licensed
            </span>
          </nav>
        </footer>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 border-t border-[#2A2A38] bg-[#1b1b20]/90 backdrop-blur-md flex justify-around items-center h-16 px-gutter">
        <button className="flex flex-col items-center justify-center text-[#8888A8] gap-0.5 hover:text-[#00ff88] transition-colors">
          <span className="material-symbols-outlined text-[22px]">deployed_code</span>
          <span className="font-mono text-[10px] tracking-widest">Product</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#00ff88] bg-[#00ff88]/10 rounded-full px-5 py-1 gap-0.5">
          <span className="material-symbols-outlined text-[22px]">menu_book</span>
          <span className="font-mono text-[10px] tracking-widest">Docs</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#8888A8] gap-0.5 hover:text-[#00ff88] transition-colors">
          <span className="material-symbols-outlined text-[22px]">terminal</span>
          <span className="font-mono text-[10px] tracking-widest">Console</span>
        </button>
      </nav>
    </div>
  );
}
