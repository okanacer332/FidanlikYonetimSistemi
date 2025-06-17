/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bu ayar, 'build' işlemi sırasında ESLint hatalarını
    // tamamen görmezden gelerek build'in başarılı olmasını sağlar.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;