"use client";

import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#2A2A38]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Wordmark */}
        <a href="/" className="flex items-center gap-0.5">
          <span className="font-mono font-bold text-xl tracking-tight text-[#00ff88]">0x</span>
          <span className="font-sans font-light text-xl tracking-tight text-[#F0F0F8]">CI</span>
        </a>

        {/* Center nav (desktop) — absolutely centered relative to full header */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {["Docs", "Changelog", "Community"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-[#8888A8] hover:text-[#F0F0F8] transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/github-ftnayan/0xCI"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-sm text-[#8888A8] hover:text-[#F0F0F8] transition-colors"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://github.com/apps/0xci-hexci/installations/new"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#00ff88] text-[#00ff88] bg-transparent px-4 py-2 text-sm font-medium rounded-md hover:bg-[#00ff88]/10 transition-all duration-200"
          >
            Install App
          </a>
          {/* Mobile hamburger */}
          <button className="md:hidden text-[#8888A8] hover:text-[#00ff88] transition-colors p-1">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
