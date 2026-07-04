export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "0xCI",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        description:
          "Zero-config GitHub App that gives every pull request its own live AWS preview URL. Powered by SST, secured by OIDC, built on your own account.",
        url: "https://0xci.online",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        codeRepository: "https://github.com/github-ftnayan/0xCI",
        isAccessibleForFree: true,
      },
      {
        "@type": "Organization",
        name: "0xCI",
        url: "https://0xci.online",
        sameAs: ["https://github.com/github-ftnayan/0xCI"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
