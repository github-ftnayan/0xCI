# 0xCI

**Zero-config GitHub App for AWS preview deployments.**

Every pull request gets its own live URL — built on your AWS account, not ours. No platform markup. No vendor lock-in.

→ **[0xci.online](https://0xci.online)**

---

## Why 0xCI

Vercel and Netlify give you a great experience — but you're paying a platform tax for it.

| | Vercel Pro | Netlify Pro | **0xCI** |
|---|---|---|---|
| Price | $20/seat/mo + usage | $19/seat/mo + usage | **$0** (you pay AWS directly) |
| Bandwidth | $0.15/GB after 1TB | $0.55/GB after 100GB | ~$0.11/GB (CloudFront) |
| Preview environments | ✓ | ✓ | ✓ |
| Your own AWS account | ✗ | ✗ | ✓ |
| No vendor lock-in | ✗ | ✗ | ✓ |
| Data sovereignty | ✗ | ✗ | ✓ |
| Long-lived secrets | Required | Required | **Never — OIDC only** |

At low-to-medium traffic (under 1M visitors/month), your AWS bill is effectively **$0.50/month** (one Route 53 hosted zone). Compare that to $20–40/month minimum on managed platforms before you even factor in usage fees.

## Vision

0xCI's goal is to make AWS deployments as effortless as Vercel — without giving up your infrastructure.

**Today:** Install the app → run one CloudFormation command → every PR gets a live preview URL automatically. Teardown is automatic on merge/close.

**Coming soon:**
- Onboarding dashboard with guided AWS account setup (no CLI needed)
- Vanity preview URLs: `pr-42.your-app.0xci.dev`
- PR comments with live preview links and deployment status
- Multi-region support

The philosophy: your code runs on your cloud. We just wire it together.

---

## How it works

1. **Install** the 0xCI GitHub App on your repository
2. **Connect AWS** — run the one-click CloudFormation stack to create an OIDC role (no long-lived keys stored anywhere)
3. **Open a PR** — 0xCI injects a deploy workflow, GitHub Actions builds on Ubuntu runners, SST provisions a live preview on your AWS account
4. **Merge or close** — preview environment is automatically torn down

```
PR opened → GitHub Actions → OIDC → AWS
                                      ├── Lambda (SSR)
                                      ├── CloudFront (CDN + URL)
                                      └── S3 (static assets)
```

Build compute runs on GitHub's free runners. You only pay AWS for what you use — typically $0/month at low traffic.

---

## Monorepo structure

```
apps/
  portal/          # Marketing site (Next.js, deployed to 0xci.online)

packages/
  probot-app/      # GitHub App (Probot + TypeScript)
  cfn-oidc/        # CloudFormation template — OIDC IAM role setup
  templates/       # Workflow templates injected into user repos
    workflows/
      deploy.yml   # PR preview deploy (sst deploy --stage pr-N)
      teardown.yml # PR close cleanup (sst remove --stage pr-N)
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full dev environment setup — including how to create a test GitHub App, configure webhook forwarding with smee.io, and run each package locally.

---

## Deploying your own setup

> **Note:** The steps below are the current manual flow. The onboarding dashboard (in progress) will handle the CloudFormation deployment and secret injection automatically — no CLI needed.

### 1. OIDC role (one-time per AWS account)

```bash
aws cloudformation deploy \
  --template-file packages/cfn-oidc/oidc-role.yml \
  --stack-name 0xci-oidc \
  --parameter-overrides GitHubOrg=<your-org> GitHubRepo=<your-repo> \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

Copy the `RoleArn` from the stack output and add it as `AWS_ROLE_ARN` in your GitHub repo secrets (Settings → Secrets → Actions). Once the onboarding dashboard ships, this step will be handled automatically via the GitHub API.

### 2. Deploy workflow

The injected `.github/workflows/deploy.yml` handles everything automatically once the OIDC role is in place.

---

## Stack

| Layer | Tech |
|---|---|
| GitHub App | [Probot](https://probot.github.io) |
| IaC | [SST v4](https://sst.dev) |
| Bundler | [OpenNext](https://opennext.js.org) |
| Auth | AWS OIDC (no stored keys) |
| Portal | Next.js 16 on Lambda + CloudFront |
| DNS | Route 53 |

---

## License

MIT
