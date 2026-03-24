/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 静态导出需要禁用 Next.js 的一些功能
  trailingSlash: true,
}

module.exports = nextConfig
