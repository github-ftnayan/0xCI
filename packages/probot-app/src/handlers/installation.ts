import type { Probot } from "probot";
import { detectFramework } from "../services/framework-detector.js";
import { injectWorkflows } from "../services/workflow-injector.js";

async function handleRepo(
  context: Parameters<Parameters<Probot["on"]>[1]>[0],
  owner: string,
  repoName: string
): Promise<void> {
  const log = context.log.child({ owner, repo: repoName });

  try {
    const { data: repo } = await context.octokit.repos.get({
      owner,
      repo: repoName,
    });

    const defaultBranch = repo.default_branch;
    const framework = await detectFramework(
      context as never,
      owner,
      repoName,
      defaultBranch
    );

    log.info(`Detected framework: ${framework}`);

    await injectWorkflows(
      context as never,
      owner,
      repoName,
      defaultBranch
    );

    log.info("Workflow injection complete");
  } catch (err) {
    log.error({ err }, "Failed to inject workflows");
  }
}

export function registerInstallationHandler(robot: Probot): void {
  // App installed on one or more repositories
  robot.on("installation.created", async (context) => {
    const owner = context.payload.installation.account.login;
    const repos = context.payload.repositories ?? [];

    context.log.info(
      `App installed by ${owner} on ${repos.length} repo(s)`
    );

    await Promise.allSettled(
      repos.map((repo) => handleRepo(context as never, owner, repo.name))
    );
  });

  // Repositories added to an existing installation
  robot.on("installation_repositories.added", async (context) => {
    const owner = context.payload.installation.account.login;
    const repos = context.payload.repositories_added ?? [];

    context.log.info(
      `${repos.length} repo(s) added to installation by ${owner}`
    );

    await Promise.allSettled(
      repos.map((repo) => handleRepo(context as never, owner, repo.name))
    );
  });
}
