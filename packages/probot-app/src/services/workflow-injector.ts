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
const PR_BODY = `## 0xCI Deployment Setup\n\nThis PR adds automated preview deployments via [0xCI](https://0xci.online).\n\nMerge to activate — every pull request will get its own live preview URL.`;

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

  // Try to push directly to the default branch; fall back to PR if branch-protected
  try {
    await context.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: commit.sha,
    });
    log.info("Pushed 0xCI workflows directly to default branch");
  } catch (err: unknown) {
    const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 0;
    if (status !== 403 && status !== 422) throw err;

    // Branch protection active — fall back to PR
    log.info("Branch protected, falling back to setup PR");
    try {
      await context.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${SETUP_BRANCH}`,
        sha: commit.sha,
      });
    } catch (refErr: unknown) {
      if (!(refErr instanceof Error && "status" in refErr && (refErr as { status: number }).status === 422)) throw refErr;
      await context.octokit.git.updateRef({ owner, repo, ref: `heads/${SETUP_BRANCH}`, sha: commit.sha, force: true });
    }

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
    }
  }
}
