import type { Metadata } from "next";
import "./globals.css";
import "./contrast.css";
import "./learning-activities.css";
import { publicPath } from "./public-path";

export const metadata: Metadata = {
  title: "Neural Field Guide — LLMs from First Token to Alignment",
  description: "A self-contained, interactive course that teaches how large language models are built, trained, aligned, and made efficient.",
  icons: {
    icon: publicPath("favicon.svg"),
    shortcut: publicPath("favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
