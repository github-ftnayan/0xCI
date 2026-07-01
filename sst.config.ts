/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "hexci",
      home: "aws",
      region: "ap-south-1",
      removal: input?.stage === "production" ? "retain" : "remove",
    };
  },
  async run() {
    const githubClientId = new sst.Secret("GitHubClientId");
    const githubClientSecret = new sst.Secret("GitHubClientSecret");
    const appId = new sst.Secret("AppId");
    const privateKey = new sst.Secret("PrivateKey");
    const webhookSecret = new sst.Secret("WebhookSecret");

    const webhook = new sst.aws.Function("Webhook", {
      handler: "packages/probot-app/src/lambda.handler",
      url: true,
      timeout: "30 seconds",
      copyFiles: [{ from: "packages/templates", to: "templates" }],
      environment: {
        APP_ID: appId.value,
        PRIVATE_KEY: privateKey.value,
        WEBHOOK_SECRET: webhookSecret.value,
        NODE_ENV: "production",
      },
      nodejs: { format: "esm", install: ["probot", "adm-zip"] },
    });

    const portal = new sst.aws.Nextjs("Portal", {
      path: "apps/portal",
      openNextVersion: "4.0.3",
      domain: {
        name: "0xci.online",
        dns: sst.aws.dns(),
      },
      environment: {
        GITHUB_CLIENT_ID: githubClientId.value,
        GITHUB_CLIENT_SECRET: githubClientSecret.value,
      },
    });

    return { url: portal.url, webhookUrl: webhook.url };
  },
});
