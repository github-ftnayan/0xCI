/// <reference path="./.sst/platform/config.d.ts" />
// 0xci-version: 2

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

    function detectFramework(): "nextjs" | "sveltekit" | "static" {
      try {
        const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["next"]) return "nextjs";
        if (deps["@sveltejs/kit"]) return "sveltekit";
      } catch {}
      return "static";
    }

    const framework = detectFramework();
    const isPR = $app.stage.startsWith("pr-");
    const domain = !isPR && process.env.DOMAIN_NAME ? process.env.DOMAIN_NAME : undefined;

    let url: $util.Output<string>;

    if (framework === "nextjs") {
      const site = new sst.aws.Nextjs("Web", {
        ...(domain ? { domain: { name: domain, dns: sst.aws.dns() } } : {}),
      });
      url = site.url;
    } else if (framework === "sveltekit") {
      const site = new sst.aws.SvelteKit("Web", {
        ...(domain ? { domain: { name: domain, dns: sst.aws.dns() } } : {}),
      });
      url = site.url;
    } else {
      const site = new sst.aws.StaticSite("Web", {
        build: { command: "npm run build", output: "dist" },
        ...(domain ? { domain: { name: domain, dns: sst.aws.dns() } } : {}),
      });
      url = site.url;
    }

    return { url };
  },
});
