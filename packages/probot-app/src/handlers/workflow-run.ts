import type { Probot } from "probot";
import { readSstOutputs, extractUrl } from "../services/artifact-reader.js";
import { postSuccess, postFailure } from "../services/pr-commenter.js";

export function registerWorkflowRunHandler(robot: Probot): void {
  robot.on("workflow_run.completed", async (context) => {
    const { workflow_run } = context.payload;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    // Only handle the 0xCI deploy workflow
    if (workflow_run.name !== "0xCI Deploy") return;

    const runUrl = workflow_run.html_url;
    const prs = workflow_run.pull_requests as Array<{ number: number }>;

    if (!prs || prs.length === 0) {
      context.log.warn({ runId: workflow_run.id }, "No PRs associated with workflow run");
      return;
    }

    const prNumber = prs[0]?.number;
    if (!prNumber) return;

    context.log.info(
      { runId: workflow_run.id, prNumber, conclusion: workflow_run.conclusion },
      "Workflow run completed"
    );

    if (workflow_run.conclusion !== "success") {
      await postFailure(context as never, owner, repo, prNumber, runUrl);
      return;
    }

    const outputs = await readSstOutputs(
      context as never,
      owner,
      repo,
      workflow_run.id
    );

    if (!outputs) {
      await postFailure(context as never, owner, repo, prNumber, runUrl);
      return;
    }

    const url = extractUrl(outputs);
    if (!url) {
      context.log.warn({ outputs }, "Could not extract URL from SST outputs");
      await postFailure(context as never, owner, repo, prNumber, runUrl);
      return;
    }

    await postSuccess(context as never, owner, repo, prNumber, url, runUrl);
    context.log.info({ prNumber, url }, "Posted deploy URL to PR");
  });
}
