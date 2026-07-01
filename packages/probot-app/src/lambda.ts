import { createProbot } from "probot";
import { registerInstallationHandler } from "./handlers/installation.js";
import { registerWorkflowRunHandler } from "./handlers/workflow-run.js";
import { registerPullRequestHandler } from "./handlers/pull-request.js";

const probot = createProbot();

await probot.load((robot) => {
  registerInstallationHandler(robot);
  registerWorkflowRunHandler(robot);
  registerPullRequestHandler(robot);
});

export const handler = async (event: {
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}) => {
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : (event.body ?? "");

  const sig = event.headers["x-hub-signature-256"];
  if (!sig || !body) return { statusCode: 401, body: "Unauthorized" };

  const valid = await probot.webhooks.verify(body, sig);
  if (!valid) return { statusCode: 401, body: "Unauthorized" };

  await probot.webhooks.receive({
    id: event.headers["x-github-delivery"] ?? "",
    name: event.headers["x-github-event"] as never,
    payload: JSON.parse(body),
  });

  return { statusCode: 200, body: "ok" };
};
