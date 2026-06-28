import type { Context } from "probot";

const MARKER = "<!-- 0xci-bot -->";

function deployingBody(): string {
  return `${MARKER}
### 0xCI Preview Environment
⏳ Deploying preview environment...`;
}

function successBody(url: string, runUrl: string): string {
  return `${MARKER}
### 0xCI Preview Environment
✅ **Preview deployed:** [${url}](${url})

<sub>[View deployment logs](${runUrl})</sub>`;
}

function failureBody(runUrl: string): string {
  return `${MARKER}
### 0xCI Preview Environment
❌ Deployment failed. [View logs](${runUrl})`;
}

function teardownBody(): string {
  return `${MARKER}
### 0xCI Preview Environment
🗑️ PR closed — preview environment is being torn down.`;
}

async function findExistingComment(
  context: Context,
  owner: string,
  repo: string,
  prNumber: number
): Promise<number | null> {
  const { data: comments } = await context.octokit.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  const found = comments.find((c) => c.body?.includes(MARKER));
  return found?.id ?? null;
}

async function upsertComment(
  context: Context,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<void> {
  const existingId = await findExistingComment(context, owner, repo, prNumber);

  if (existingId) {
    await context.octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existingId,
      body,
    });
  } else {
    await context.octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
  }
}

export async function postDeploying(
  context: Context,
  owner: string,
  repo: string,
  prNumber: number
): Promise<void> {
  await upsertComment(context, owner, repo, prNumber, deployingBody());
}

export async function postSuccess(
  context: Context,
  owner: string,
  repo: string,
  prNumber: number,
  url: string,
  runUrl: string
): Promise<void> {
  await upsertComment(context, owner, repo, prNumber, successBody(url, runUrl));
}

export async function postFailure(
  context: Context,
  owner: string,
  repo: string,
  prNumber: number,
  runUrl: string
): Promise<void> {
  await upsertComment(context, owner, repo, prNumber, failureBody(runUrl));
}

export async function postTeardown(
  context: Context,
  owner: string,
  repo: string,
  prNumber: number
): Promise<void> {
  await upsertComment(context, owner, repo, prNumber, teardownBody());
}
