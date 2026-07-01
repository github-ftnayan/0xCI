import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import sodium from "libsodium-wrappers";

async function injectSecret(
  token: string,
  owner: string,
  repo: string,
  roleArn: string
): Promise<{ repo: string; error?: string }> {
  const keyRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!keyRes.ok) return { repo, error: "failed_to_get_public_key" };

  const { key, key_id } = (await keyRes.json()) as { key: string; key_id: string };

  await sodium.ready;
  const keyBytes = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
  const encryptedBytes = sodium.crypto_box_seal(sodium.from_string(roleArn), keyBytes);
  const encryptedValue = sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);

  const secretRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/secrets/AWS_ROLE_ARN`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encrypted_value: encryptedValue, key_id }),
    }
  );

  if (!secretRes.ok && secretRes.status !== 204) return { repo, error: "failed_to_inject_secret" };
  return { repo };
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;
  if (!token) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const body = await req.json();
  const { repos, accountId } = body as {
    repos: Array<{ owner: string; repo: string }>;
    accountId: string;
  };

  if (!repos?.length || !/^\d{12}$/.test(accountId)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const roleArn = `arn:aws:iam::${accountId}:role/0xci-deploy-role`;

  const results = await Promise.all(
    repos.map(({ owner, repo }) => injectSecret(token, owner, repo, roleArn))
  );

  const failed = results.filter((r) => r.error);
  return NextResponse.json({ roleArn, results, failed });
}
