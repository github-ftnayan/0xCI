import { run } from "probot";
import type { Probot } from "probot";
import { registerInstallationHandler } from "./handlers/installation.js";

function app(robot: Probot) {
  robot.log.info("0xCI Probot app started");
  registerInstallationHandler(robot);
}

run(app);
