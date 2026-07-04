"use client";

import { useState } from "react";

const REGISTRARS = [
  { name: "GoDaddy",    url: (d: string) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(d)}` },
  { name: "Namecheap",  url: (d: string) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}` },
  { name: "Porkbun",    url: (d: string) => `https://porkbun.com/checkout/search?q=${encodeURIComponent(d)}` },
  { name: "Hostinger",  url: (d: string) => `https://www.hostinger.com/domain-name-results?from=homepage&domain=${encodeURIComponent(d)}` },
  { name: "Cloudflare", url: (d: string) => `https://domains.cloudflare.com/?domain=${encodeURIComponent(d)}` },
];

export function DomainFinder() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setDomain(null);
    setAvailable(null);
    try {
      const res = await fetch(`/api/domain?domain=${encodeURIComponent(q)}`);
      const data = await res.json();
      setDomain(data.domain);
      setAvailable(data.available);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!domain) return;
    await navigator.clipboard.writeText(
      `domain: {\n  name: "${domain}",\n  dns: sst.aws.dns(),\n}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff88]/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        <p className="text-center text-xs font-mono text-[#00ff88] tracking-widest uppercase mb-4">
          Domain Finder
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight text-[#F0F0F8] mb-3">
          Find your domain.
          <br />
          <span className="text-[#8888A8] font-light">We generate the config.</span>
        </h2>
        <p className="text-center text-[#8888A8] mb-10 max-w-lg mx-auto text-sm leading-relaxed">
          Check availability and get your{" "}
          <code className="font-mono text-[#A8FFB8] text-xs">sst.config.ts</code>{" "}
          domain block auto-generated.
        </p>

        {/* Search bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="my-startup.com"
            className="flex-1 px-4 py-3 rounded-lg bg-[#111118] border border-[#2A2A38] font-mono text-sm text-[#F0F0F8] placeholder-[#6b6b85] focus:outline-none focus:border-[#00ff88]/50 transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-[#00ff88] text-[#0A0A0F] font-semibold text-sm rounded-lg hover:brightness-105 transition-all disabled:opacity-60"
          >
            {loading ? "Checking…" : "Search"}
          </button>
        </div>

        {/* Results */}
        {domain && (
          <div className="mt-6 space-y-4">

            {/* Availability card */}
            <div className={`rounded-xl border p-5 flex items-center gap-4 ${
              available === true
                ? "border-[#00ff88]/30 bg-[#00ff88]/[0.04]"
                : available === false
                ? "border-[#FF4455]/30 bg-[#FF4455]/[0.04]"
                : "border-[#2A2A38] bg-[#111118]"
            }`}>
              {/* Status dot */}
              <div className={`w-3 h-3 rounded-full shrink-0 ${
                available === true  ? "bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]" :
                available === false ? "bg-[#FF4455] shadow-[0_0_8px_rgba(255,68,85,0.6)]" :
                "bg-[#44445A]"
              }`} />

              <div className="flex-1 min-w-0">
                <p className="font-mono text-lg font-semibold text-[#F0F0F8] truncate">{domain}</p>
                <p className={`text-xs font-mono mt-0.5 ${
                  available === true  ? "text-[#00ff88]" :
                  available === false ? "text-[#FF4455]" :
                  "text-[#8888A8]"
                }`}>
                  {available === true  ? "Available — grab it before someone else does" :
                   available === false ? "Already registered" :
                   "Availability unknown for this TLD"}
                </p>
              </div>

              {available !== null && (
                <span className={`shrink-0 inline-flex items-center justify-center text-[11px] font-mono font-bold px-3 py-1 rounded-full ${
                  available
                    ? "bg-[#00ff88] text-[#0A0A0F]"
                    : "bg-[#FF4455]/20 text-[#FF4455] border border-[#FF4455]/30"
                }`}>
                  <span className="translate-y-[1px] inline-block">{available ? "Available" : "Taken"}</span>
                </span>
              )}
            </div>

            {/* Registrar links */}
            <div className="rounded-xl border border-[#2A2A38] bg-[#0D0D14] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#2A2A38]">
                <span className="text-xs font-mono text-[#8888A8]">Register at</span>
              </div>
              <div className="divide-y divide-[#2A2A38]/60">
                {REGISTRARS.map((r) => (
                  <a
                    key={r.name}
                    href={r.url(domain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#00ff88]/[0.03] transition-colors group"
                  >
                    <span className="text-sm font-mono text-[#F0F0F8]">{r.name}</span>
                    <span className="text-xs font-mono text-[#8888A8] group-hover:text-[#00ff88] transition-colors">
                      Search →
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* sst.config.ts snippet */}
            <div className="rounded-xl border border-[#2A2A38] bg-[#0D0D14] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A38]">
                <span className="text-xs font-mono text-[#8888A8]">sst.config.ts</span>
                <button
                  onClick={copy}
                  className="text-xs font-mono text-[#8888A8] hover:text-[#00ff88] transition-colors p-2 -m-2"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed">
                <span className="text-[#8888A8]">{"// auto-generated\n"}</span>
                <span className="text-[#4488FF]">{"domain"}</span>
                <span className="text-[#8888A8]">{": {\n"}</span>
                <span className="text-[#4488FF]">{"  name"}</span>
                <span className="text-[#8888A8]">{": "}</span>
                <span className="text-[#FFB700]">{`"${domain}"`}</span>
                <span className="text-[#8888A8]">{",\n"}</span>
                <span className="text-[#4488FF]">{"  dns"}</span>
                <span className="text-[#8888A8]">{": "}</span>
                <span className="text-[#00ff88]">{"sst.aws.dns()"}</span>
                <span className="text-[#8888A8]">{",\n}"}</span>
              </pre>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
