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
  title: "0xCI - AWS preview URLs for every pull request",
  description:
    "Zero-config GitHub App that gives every pull request its own live AWS preview URL. Powered by SST, secured by OIDC, built on your own account.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  alternates: { canonical: "/" },
  verification: {
    google: "bki_aaFmuvNh7ti__tElUWkmBo_BNdZXMKzdEx12_q0",
  },
  openGraph: {
    title: "0xCI - AWS preview URLs for every pull request",
    description:
      "Zero-config GitHub App that gives every pull request its own live AWS preview URL.",
    url: "https://0xci.online",
    siteName: "0xCI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "0xCI - AWS preview URLs for every pull request",
    description:
      "Zero-config GitHub App that gives every pull request its own live AWS preview URL.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
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
