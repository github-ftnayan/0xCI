import type { Context } from "probot";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

// ponytail: LAMBDA_TASK_ROOT indicates Lambda environment where copyFiles lands at task root
const TEMPLATES_DIR = process.env.LAMBDA_TASK_ROOT
  ? join(process.env.LAMBDA_TASK_ROOT, "templates")
  : fileURLToPath(new URL("../../../templates", import.meta.url));

const SETUP_BRANCH = "0xci/setup";
const PR_TITLE = "chore: add 0xCI deployment workflows";
const PR_BODY = `## 0xCI Deployment Setup

This PR adds automated preview deployments to your repository via [0xCI](https://0xci.dev).

### What's included
- \`.github/workflows/deploy.yml\` — deploys a preview environment on every PR
- \`.github/workflows/teardown.yml\` — destroys the preview environment when a PR is closed
- \`sst.config.ts\` — SST v3 infrastructure blueprint (auto-detects your framework)

### Before merging
1. **Deploy the AWS OIDC role** using the CloudFormation template from your [0xCI dashboard](https://0xci.dev/setup/aws)
2. **Add the following GitHub secret** to this repository:
   - \`AWS_ROLE_ARN\` — the role ARN output from the CloudFormation stack
   - \`AWS_REGION\` — your preferred AWS region (e.g. \`us-east-1\`)

Once merged, every pull request will get its own live preview URL posted as a comment. 🚀`;

function readTemplate(relativePath: string): string {
  return readFileSync(join(TEMPLATES_DIR, relativePath), "utf-8");
}

async function fileExists(
  context: Context,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<boolean> {
  try {
    await context.octokit.repos.getContent({ owner, repo, path, ref });
    return true;
  } catch {
    return false;
  }
}

export async function injectWorkflows(
  context: Context,
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<void> {
  const log = context.log.child({ owner, repo });

  // Skip if workflows already exist (re-installation guard)
  const alreadyExists = await fileExists(
    context,
    owner,
    repo,
    ".github/workflows/deploy.yml",
    defaultBranch
  );
  if (alreadyExists) {
    log.info("0xCI workflows already present, skipping injection");
    return;
  }

  // Get the SHA of the default branch HEAD
  const { data: refData } = await context.octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`,
  });
  const baseSha = refData.object.sha;

  // Get the base tree SHA
  const { data: commitData } = await context.octokit.git.getCommit({
    owner,
    repo,
    commit_sha: baseSha,
  });
  const baseTreeSha = commitData.tree.sha;

  // Create blobs for each file
  const files = [
    {
      path: ".github/workflows/deploy.yml",
      content: readTemplate("workflows/deploy.yml"),
    },
    {
      path: ".github/workflows/teardown.yml",
      content: readTemplate("workflows/teardown.yml"),
    },
    {
      path: "sst.config.ts",
      content: readTemplate("sst.config.ts"),
    },
  ];

  const blobs = await Promise.all(
    files.map(({ content }) =>
      context.octokit.git.createBlob({
        owner,
        repo,
        content,
        encoding: "utf-8",
      })
    )
  );

  // Create a new tree
  const { data: tree } = await context.octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: files.map(({ path }, i) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: blobs[i]?.data.sha,
    })),
  });

  // Create a commit
  const { data: commit } = await context.octokit.git.createCommit({
    owner,
    repo,
    message: "chore: add 0xCI deployment workflows",
    tree: tree.sha,
    parents: [baseSha],
  });

  // Create (or update) the setup branch
  try {
    await context.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${SETUP_BRANCH}`,
      sha: commit.sha,
    });
  } catch (err: unknown) {
    // Branch already exists — force update it
    if (
      err instanceof Error &&
      "status" in err &&
      (err as { status: number }).status === 422
    ) {
      await context.octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${SETUP_BRANCH}`,
        sha: commit.sha,
        force: true,
      });
    } else {
      throw err;
    }
  }

  // Open a PR (skip if one already exists)
  const { data: existingPRs } = await context.octokit.pulls.list({
    owner,
    repo,
    head: `${owner}:${SETUP_BRANCH}`,
    state: "open",
  });

  if (existingPRs.length === 0) {
    await context.octokit.pulls.create({
      owner,
      repo,
      title: PR_TITLE,
      body: PR_BODY,
      head: SETUP_BRANCH,
      base: defaultBranch,
    });
    log.info("Opened 0xCI setup PR");
  } else {
    log.info("Setup PR already open, skipping");
  }
}
