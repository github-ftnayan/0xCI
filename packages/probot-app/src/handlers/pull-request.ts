import type { Probot } from "probot";
import { postTeardown } from "../services/pr-commenter.js";

export function registerPullRequestHandler(robot: Probot): void {
  robot.on("pull_request.closed", async (context) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const prNumber = context.payload.pull_request.number;

    // Skip the 0xCI setup PR itself
    if (context.payload.pull_request.head.ref === "0xci/setup") return;

    context.log.info({ prNumber }, "PR closed — marking teardown in progress");

    await postTeardown(context as never, owner, repo, prNumber);
  });
}
