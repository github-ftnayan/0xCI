import type { Metadata } from "next";
import localFont from "next/font/local";
import { JsonLd } from "../components/JsonLd";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://0xci.online"),
  title: "0xCI - AWS preview and production deploys for every pull request",
  description:
    "Zero-config GitHub App that gives every pull request its own live AWS preview URL, then ships every merge to production on your own custom domain. Powered by SST, secured by OIDC, built on your own account.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  alternates: { canonical: "/" },
  verification: {
    google: "bki_aaFmuvNh7ti__tElUWkmBo_BNdZXMKzdEx12_q0",
  },
  openGraph: {
    title: "0xCI - AWS preview and production deploys for every pull request",
    description:
      "Zero-config GitHub App that gives every pull request its own live AWS preview URL, then ships every merge to production on your own custom domain.",
    url: "https://0xci.online",
    siteName: "0xCI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "0xCI - AWS preview and production deploys for every pull request",
    description:
      "Zero-config GitHub App that gives every pull request its own live AWS preview URL, then ships every merge to production on your own custom domain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans text-[#F0F0F8] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
