import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import sodium from "libsodium-wrappers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { owner, repo, accountId } = body as { owner: string; repo: string; accountId: string };

  if (!owner || !repo || !accountId || !/^\d{12}$/.test(accountId)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const roleArn = `arn:aws:iam::${accountId}:role/0xci-deploy-role`;

  // Get the repo's public key for encrypting the secret
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

  if (!keyRes.ok) {
    return NextResponse.json({ error: "failed_to_get_public_key" }, { status: keyRes.status });
  }

  const { key, key_id } = await keyRes.json() as { key: string; key_id: string };

  // GitHub requires secrets to be encrypted with the repo's public key via libsodium
  await sodium.ready;
  const keyBytes = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
  const secretBytes = sodium.from_string(roleArn);
  const encryptedBytes = sodium.crypto_box_seal(secretBytes, keyBytes);
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

  if (!secretRes.ok && secretRes.status !== 204) {
    return NextResponse.json({ error: "failed_to_inject_secret" }, { status: secretRes.status });
  }

  return NextResponse.json({ success: true, roleArn });
}
