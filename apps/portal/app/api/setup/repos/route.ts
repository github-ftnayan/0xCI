import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const installationId = searchParams.get("installation_id");

  if (!installationId) {
    return NextResponse.json({ error: "installation_id required" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/user/installations/${installationId}/repositories`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "failed_to_fetch_repos" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({
    repos: data.repositories.map((r: { id: number; name: string; full_name: string; private: boolean }) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      private: r.private,
    })),
  });
}
