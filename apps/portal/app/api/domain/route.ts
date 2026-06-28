import { NextRequest, NextResponse } from "next/server";

// RDAP servers for common TLDs — free, no API key, ICANN official protocol
// Sources: https://data.iana.org/rdap/dns.json
const RDAP: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1",
  net: "https://rdap.verisign.com/net/v1",
  org: "https://rdap.publicinterestregistry.org/rdap",
  dev: "https://pubapi.registry.google/rdap",
  app: "https://pubapi.registry.google/rdap",
  xyz: "https://rdap.centralnic.com/xyz",
  ai:  "https://rdap.identitydigital.services/rdap",
};

async function checkAvailability(domain: string, tld: string): Promise<boolean | null> {
  const base = RDAP[tld];
  if (!base) return null;
  try {
    const res = await fetch(`${base}/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/rdap+json" },
    });
    if (res.status === 200) return false; // registered = taken
    if (res.status === 404) return true;  // not found = available
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("domain")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const domain = query.includes(".") ? query : `${query}.com`;
  const tld = domain.split(".").pop() ?? "com";
  const available = await checkAvailability(domain, tld);

  return NextResponse.json({ domain, available });
}
