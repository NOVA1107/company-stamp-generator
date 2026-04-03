import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Free Digital Company Stamp Generator | Create Custom Seals Online",
  description: "Generate high-quality digital company stamps, seals, and logos instantly. No Photoshop needed. Support 4K download.",
  keywords: "Company stamp, digital seal generator, online stamp maker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics gaId="G-QQ8RJJ1LZ2" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}