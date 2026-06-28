import type { Context } from "probot";

export type Framework = "nextjs" | "sveltekit" | "static";

export async function detectFramework(
  context: Context,
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<Framework> {
  try {
    const { data } = await context.octokit.repos.getContent({
      owner,
      repo,
      path: "package.json",
      ref: defaultBranch,
    });

    if ("content" in data && data.content) {
      const pkg = JSON.parse(Buffer.from(data.content, "base64").toString());
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps["next"]) return "nextjs";
      if (deps["@sveltejs/kit"]) return "sveltekit";
    }
  } catch {
    // No package.json or parse error — treat as static
  }

  return "static";
}
