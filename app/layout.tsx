/* eslint-disable @next/next/next-script-for-ga -- Keep the official Google tag snippet directly inside the shared head. */
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import "./brand.css";
import "./learning-activities.css";
import "./contrast.css";
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
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZLJDBH230K" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-ZLJDBH230K');
        ` }} />
      </head>
      <body style={{ "--brand-mark-image": `url("${publicPath("brand/neural-field-guide-mark.png")}")` } as CSSProperties}>{children}</body>
    </html>
  );
}
