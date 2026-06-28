# Contributing to 0xCI

Thanks for your interest. This doc covers how to set up the full development environment, what each package does, and how to submit changes.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Repo setup](#repo-setup)
- [Package: probot-app](#package-probot-app)
- [Package: portal](#package-portal)
- [Package: cfn-oidc](#package-cfn-oidc)
- [Package: templates](#package-templates)
- [Submitting changes](#submitting-changes)

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| pnpm | 9+ | Package manager |
| AWS CLI | v2 | Deploying CloudFormation + SST |
| GitHub account | — | Creating the test GitHub App |

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

---

## Repo setup

```bash
git clone https://github.com/github-ftnayan/0xCI
cd 0xCI
pnpm install
```

This installs all workspace dependencies across `apps/` and `packages/` in one shot.

---

## Package: probot-app

The core GitHub App. Listens for `installation`, `push`, and `pull_request` webhooks and injects workflow files into user repositories.

### 1. Create a test GitHub App

Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App** and set:

- **Webhook URL:** your smee.io proxy (see step 3)
- **Permissions:**
  - Repository: `Contents: Read & Write`, `Workflows: Read & Write`, `Secrets: Read & Write`, `Pull Requests: Read & Write`
- **Subscribe to events:** `Installation`, `Push`, `Pull request`

### 2. Configure environment

```bash
cp packages/probot-app/.env.example packages/probot-app/.env
```

Fill in `.env`:

```
APP_ID=          # from the GitHub App settings page
PRIVATE_KEY=     # download the .pem from GitHub App settings, paste the full contents
WEBHOOK_SECRET=  # a random string you set when creating the app
GITHUB_CLIENT_ID=      # OAuth App client ID (optional, for future OAuth flow)
GITHUB_CLIENT_SECRET=  # OAuth App client secret (optional)
WEBHOOK_PROXY_URL=     # your smee.io channel URL (see step 3)
PORT=3000
```

> Never commit `.env`. It is gitignored.

### 3. Set up webhook forwarding

Install the smee client to forward GitHub webhooks to localhost:

```bash
npx smee-client --url https://smee.io/<your-channel> --target http://localhost:3000/api/github/webhooks
```

Or set `WEBHOOK_PROXY_URL` in `.env` and let Probot handle it automatically.

### 4. Run

```bash
pnpm --filter probot-app dev
```

Install your test GitHub App on a test repository — the app will receive webhooks and inject the deploy/teardown workflows automatically.

---

## Package: portal

The marketing site at [0xci.online](https://0xci.online). Built with Next.js 16.

### Run locally

```bash
pnpm --filter portal dev
```

Opens at `http://localhost:3000`.

No environment variables are required — the domain availability API uses RDAP (free, no key needed).

### Deploy

Deployments are automated via GitHub Actions on push to `main`. The workflow uses AWS OIDC — no static keys.

To deploy manually:

```bash
npx sst deploy --stage production
```

Requires AWS credentials with the permissions defined in `packages/cfn-oidc/oidc-role.yml`.

---

## Package: cfn-oidc

A parameterized CloudFormation template that creates an IAM OIDC Identity Provider + deploy role for a given GitHub org/repo. This is what users run once to connect their AWS account.

The template accepts:

| Parameter | Description |
|---|---|
| `GitHubOrg` | GitHub username or org |
| `GitHubRepo` | Repo name (`*` for all repos in the org) |
| `RoleName` | IAM role name (default: `0xci-deploy-role`) |
| `OIDCProviderArn` | Existing OIDC provider ARN (leave blank to create one) |

> AWS only allows one OIDC provider per issuer URL per account. If `token.actions.githubusercontent.com` already exists, pass its ARN via `OIDCProviderArn`.

---

## Package: templates

Workflow YAML files that the Probot app injects into user repositories via the GitHub Trees API:

- `workflows/deploy.yml` — triggered on `pull_request`, runs `sst deploy --stage pr-N`
- `workflows/teardown.yml` — triggered on `pull_request: closed`, runs `sst remove --stage pr-N`

Both use OIDC (`aws-actions/configure-aws-credentials`) — no stored AWS keys.

If you change these templates, test them against a real repository with the Probot app running locally before merging.

---

## Submitting changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Open a PR — describe what changed and why
4. Keep PRs focused; one concern per PR

For bug reports or feature requests, open an issue first.
