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
    const portal = new sst.aws.Nextjs("Portal", {
      path: "apps/portal",
      openNextVersion: "4.0.3",
      domain: {
        name: "0xci.online",
        dns: sst.aws.dns(),
      },
    });

    return { url: portal.url };
  },
});
