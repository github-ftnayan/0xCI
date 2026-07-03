import type { Context } from "probot";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

// ponytail: LAMBDA_TASK_ROOT indicates Lambda environment where copyFiles lands at task root
const TEMPLATES_DIR = process.env.LAMBDA_TASK_ROOT
  ? join(process.env.LAMBDA_TASK_ROOT, "templates")
  : fileURLToPath(new URL("../../../templates", import.meta.url));

const SETUP_BRANCH = "0xci/setup";
const PR_TITLE_INITIAL = "chore: add 0xCI deployment workflows";
const PR_TITLE_UPDATE = "chore: update 0xCI deployment workflows";
const PR_BODY_INITIAL = `## 0xCI Deployment Setup\n\nThis PR adds automated preview deployments via [0xCI](https://0xci.online).\n\nMerge to activate — every pull request will get its own live preview URL.`;
const PR_BODY_UPDATE = `## 0xCI Template Update\n\nThis PR updates the 0xCI deployment workflows to the latest template version.\n\nMerge to apply the latest fixes and improvements.`;

// Bumped whenever templates change in a way that requires re-injection into existing repos.
const TEMPLATE_VERSION = 2;

function readTemplate(relativePath: string): string {
  return readFileSync(join(TEMPLATES_DIR, relativePath), "utf-8");
}

function extractVersion(content: string): number {
  const match = content.match(/(?:#|\/\/) 0xci-version: (\d+)/);
  return match ? parseInt(match[1]!, 10) : 0;
}

async function getInstalledVersion(
  context: Context,
  owner: string,
  repo: string,
  ref: string
): Promise<number> {
  try {
    const { data } = await context.octokit.repos.getContent({
      owner,
      repo,
      path: ".github/workflows/deploy.yml",
      ref,
    });
    if (!("content" in data)) return 0;
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return extractVersion(content);
  } catch {
    return -1; // file doesn't exist
  }
}

export async function injectWorkflows(
  context: Context,
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<void> {
  const log = context.log.child({ owner, repo });

  const installedVersion = await getInstalledVersion(context, owner, repo, defaultBranch);

  if (installedVersion === TEMPLATE_VERSION) {
    log.info("0xCI workflows are up to date, skipping injection");
    return;
  }

  const isUpdate = installedVersion > 0;
  log.info(
    isUpdate
      ? `Updating 0xCI workflows from v${installedVersion} to v${TEMPLATE_VERSION}`
      : "Injecting 0xCI workflows for the first time"
  );

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

  const commitMessage = isUpdate
    ? `chore: update 0xCI deployment workflows to v${TEMPLATE_VERSION}`
    : "chore: add 0xCI deployment workflows";

  // Create a commit
  const { data: commit } = await context.octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
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
    log.info(
      isUpdate
        ? `Updated 0xCI workflows to v${TEMPLATE_VERSION} directly on default branch`
        : "Pushed 0xCI workflows directly to default branch"
    );
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
        title: isUpdate ? PR_TITLE_UPDATE : PR_TITLE_INITIAL,
        body: isUpdate ? PR_BODY_UPDATE : PR_BODY_INITIAL,
        head: SETUP_BRANCH,
        base: defaultBranch,
      });
      log.info(isUpdate ? "Opened 0xCI update PR" : "Opened 0xCI setup PR");
    }
  }
}
