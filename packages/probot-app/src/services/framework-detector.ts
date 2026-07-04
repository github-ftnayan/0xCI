import type { Context } from "probot";

export type Framework =
  | "nextjs"
  | "astro"
  | "remix"
  | "nuxt"
  | "sveltekit"
  | "solidstart"
  | "tanstack-start"
  | "analog"
  | "static";

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

      // Ordered by popularity — most common framework wins if multiple match.
      if (deps["next"]) return "nextjs";
      if (deps["astro"]) return "astro";
      if (deps["@remix-run/dev"] || deps["@remix-run/react"]) return "remix";
      if (deps["nuxt"]) return "nuxt";
      if (deps["@sveltejs/kit"]) return "sveltekit";
      if (deps["@solidjs/start"]) return "solidstart";
      if (deps["@tanstack/react-start"] || deps["@tanstack/solid-start"])
        return "tanstack-start";
      if (deps["@analogjs/platform"]) return "analog";
    }
  } catch {
    // No package.json or parse error — treat as static
  }

  return "static";
}
