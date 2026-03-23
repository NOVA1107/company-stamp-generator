import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "公司印章生成器",
  description: "在线印章生成与文档合成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
