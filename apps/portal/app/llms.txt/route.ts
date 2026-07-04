const BODY = `# 0xCI

> Zero-config GitHub App that gives every pull request its own live AWS preview URL. Powered by SST, secured by OIDC, built on your own account.

0xCI is a free, open-source alternative to Vercel/Netlify preview deployments. Instead of hosting your app on a third-party platform, 0xCI deploys every pull request to your own AWS account using SST and OpenID Connect (OIDC), so no long-lived AWS credentials are ever stored.

## Audience

Developers and teams who want Vercel-style PR preview deployments without vendor lock-in, using infrastructure they already own (AWS).

## How it works

1. Install the 0xCI GitHub App on a repository.
2. Connect an AWS account via OIDC (no long-lived secrets).
3. Every pull request gets a live preview URL automatically, deployed via SST.

## Key links

- [Homepage](https://0xci.online)
- [Docs](https://0xci.online/docs)
- [Changelog](https://0xci.online/changelog)
- [Source code](https://github.com/github-ftnayan/0xCI)
- [Install the GitHub App](https://github.com/apps/0xci-hexci/installations/new)

## Pricing

0xCI itself is free and open-source (MIT licensed). Users pay only their own AWS usage costs (CloudFront, Route 53, etc.).
`;

export async function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
