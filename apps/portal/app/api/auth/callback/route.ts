import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  // installation_id comes directly when redirected from app install flow,
  // or via state param when using a manual OAuth authorize URL
  const installationId =
    searchParams.get("installation_id") ?? searchParams.get("state") ?? null;

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(new URL("/?error=oauth_failed", req.url));
  }

  const setupUrl = installationId
    ? `/setup?installation_id=${installationId}`
    : "/setup";

  const response = NextResponse.redirect(new URL(setupUrl, req.url));
  response.cookies.set("gh_token", tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
    path: "/",
  });

  return response;
}
