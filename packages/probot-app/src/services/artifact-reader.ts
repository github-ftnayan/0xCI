import type { Context } from "probot";
import AdmZip from "adm-zip";

export async function readSstOutputs(
  context: Context,
  owner: string,
  repo: string,
  runId: number
): Promise<Record<string, unknown> | null> {
  const { data: { artifacts } } =
    await context.octokit.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: runId,
    });

  const artifact = artifacts.find((a) => a.name === "sst-outputs");
  if (!artifact) {
    context.log.warn({ runId }, "No sst-outputs artifact found");
    return null;
  }

  // Download the zip — octokit follows the 302 redirect automatically
  const { data } = await context.octokit.request(
    "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
    {
      owner,
      repo,
      artifact_id: artifact.id,
      archive_format: "zip",
      request: { redirect: "follow" },
    }
  );

  const zip = new AdmZip(Buffer.from(data as ArrayBuffer));
  const entry = zip.getEntry("output.json");
  if (!entry) {
    context.log.warn({ runId }, "outputs.json not found in artifact zip");
    return null;
  }

  return JSON.parse(entry.getData().toString("utf-8")) as Record<string, unknown>;
}

export function extractUrl(outputs: Record<string, unknown>): string | null {
  // SST writes outputs keyed by component name, e.g. { App: { url: "https://..." } }
  for (const value of Object.values(outputs)) {
    if (value && typeof value === "object") {
      const url = (value as Record<string, unknown>).url;
      if (typeof url === "string" && url.startsWith("https://")) return url;
    }
    // Flat key variant: { AppUrl: "https://..." }
    if (typeof value === "string" && value.startsWith("https://")) return value;
  }
  return null;
}
