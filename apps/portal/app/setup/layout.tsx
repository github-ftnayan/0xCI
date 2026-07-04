import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup - 0xCI",
  robots: { index: false, follow: false },
};

export default function SetupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
