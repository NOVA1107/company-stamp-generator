/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export' 以支持 NextAuth API 路由
  // 如果需要静态部署，需使用 @cloudflare/next-on-pages
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages 需要
  trailingSlash: true,
}

module.exports = nextConfig