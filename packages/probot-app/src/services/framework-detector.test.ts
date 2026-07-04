import { describe, expect, it } from "vitest";
import type { Context } from "probot";
import { detectFramework } from "./framework-detector.js";

function mockContext(pkg: Record<string, unknown> | null): Context {
  return {
    octokit: {
      repos: {
        getContent: async () => {
          if (pkg === null) throw new Error("Not Found");
          const content = Buffer.from(JSON.stringify(pkg)).toString("base64");
          return { data: { content } };
        },
      },
    },
  } as unknown as Context;
}

describe("detectFramework", () => {
  it.each([
    ["nextjs", { dependencies: { next: "^15.0.0" } }],
    ["astro", { dependencies: { astro: "^4.0.0" } }],
    ["remix", { devDependencies: { "@remix-run/dev": "^2.0.0" } }],
    ["remix", { dependencies: { "@remix-run/react": "^2.0.0" } }],
    ["nuxt", { dependencies: { nuxt: "^3.0.0" } }],
    ["sveltekit", { devDependencies: { "@sveltejs/kit": "^2.0.0" } }],
    ["solidstart", { dependencies: { "@solidjs/start": "^1.0.0" } }],
    ["tanstack-start", { dependencies: { "@tanstack/react-start": "^1.0.0" } }],
    ["tanstack-start", { dependencies: { "@tanstack/solid-start": "^1.0.0" } }],
    ["analog", { dependencies: { "@analogjs/platform": "^1.0.0" } }],
  ] as const)("detects %s", async (expected, pkg) => {
    const result = await detectFramework(
      mockContext(pkg),
      "owner",
      "repo",
      "main"
    );
    expect(result).toBe(expected);
  });

  it("falls back to static when no framework dependency matches", async () => {
    const result = await detectFramework(
      mockContext({ dependencies: { react: "^18.0.0" } }),
      "owner",
      "repo",
      "main"
    );
    expect(result).toBe("static");
  });

  it("falls back to static when package.json is missing", async () => {
    const result = await detectFramework(
      mockContext(null),
      "owner",
      "repo",
      "main"
    );
    expect(result).toBe("static");
  });

  it("prioritizes nextjs when multiple framework deps are present", async () => {
    const result = await detectFramework(
      mockContext({
        dependencies: { next: "^15.0.0", astro: "^4.0.0" },
      }),
      "owner",
      "repo",
      "main"
    );
    expect(result).toBe("nextjs");
  });
});
