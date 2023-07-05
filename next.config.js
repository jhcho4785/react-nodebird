/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // transpilePackages: ['antd', '@ant-design/icons', '@ant-design/icons-svg'],
  reactStrictMode: true,
  compress: true, //압축 지원
  webpack(config, { webpack }) {
    const prod = process.env.NODE_ENV === 'production';
    return {
      ...config,
      mode: prod ? 'production' : 'development',
      devtool: prod ? 'hidden-source-map' : 'eval', //배포 모드 시 소스 맵 숨김
    };
  },
  compiler: {
    emotion: true,
  },
};

// module.exports = withBundleAnalyzer(nextConfig);
module.exports = nextConfig;
