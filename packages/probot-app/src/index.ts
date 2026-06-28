import { run } from "probot";
import type { Probot } from "probot";
import { registerInstallationHandler } from "./handlers/installation.js";
import { registerWorkflowRunHandler } from "./handlers/workflow-run.js";
import { registerPullRequestHandler } from "./handlers/pull-request.js";

function app(robot: Probot) {
  robot.log.info("0xCI Probot app started");
  registerInstallationHandler(robot);
  registerWorkflowRunHandler(robot);
  registerPullRequestHandler(robot);
}

run(app);
