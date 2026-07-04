/// <reference path="./.sst/platform/config.d.ts" />
// 0xci-version: 3

export default $config({
  app(input) {
    return {
      name: (() => {
        const raw = (process.env.REPO_NAME ?? "app").toLowerCase().replace(/[^a-z0-9-]/g, "-");
        return /^[a-z]/.test(raw) ? raw : `app-${raw}`;
      })(),
      home: "aws",
      removal: input?.stage?.startsWith("pr-") ? "remove" : "retain",
    };
  },
  async run() {
    const { readFileSync } = await import("fs");

    type Framework =
      | "nextjs"
      | "astro"
      | "remix"
      | "nuxt"
      | "sveltekit"
      | "solidstart"
      | "tanstack-start"
      | "analog"
      | "static";

    function detectFramework(): Framework {
      try {
        const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
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
      } catch {}
      return "static";
    }

    const framework = detectFramework();
    const isPR = $app.stage.startsWith("pr-");
    const domain = !isPR && process.env.DOMAIN_NAME ? process.env.DOMAIN_NAME : undefined;
    const domainArgs = domain ? { domain: { name: domain, dns: sst.aws.dns() } } : {};

    let url: $util.Output<string>;

    switch (framework) {
      case "nextjs":
        url = new sst.aws.Nextjs("Web", { ...domainArgs }).url;
        break;
      case "astro":
        url = new sst.aws.Astro("Web", { ...domainArgs }).url;
        break;
      case "remix":
        url = new sst.aws.Remix("Web", { ...domainArgs }).url;
        break;
      case "nuxt":
        url = new sst.aws.Nuxt("Web", { ...domainArgs }).url;
        break;
      case "sveltekit":
        url = new sst.aws.SvelteKit("Web", { ...domainArgs }).url;
        break;
      case "solidstart":
        url = new sst.aws.SolidStart("Web", { ...domainArgs }).url;
        break;
      case "tanstack-start":
        url = new sst.aws.TanStackStart("Web", { ...domainArgs }).url;
        break;
      case "analog":
        url = new sst.aws.Analog("Web", { ...domainArgs }).url;
        break;
      default:
        url = new sst.aws.StaticSite("Web", {
          build: { command: "npm run build", output: "dist" },
          ...domainArgs,
        }).url;
    }

    return { url };
  },
});
