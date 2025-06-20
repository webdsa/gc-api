/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações para APIs
  experimental: {
    // Otimizações de performance
    optimizePackageImports: ['@next/font'],
  },
  
  // Headers de segurança e performance
  async headers() {
    return [
      {
        // Aplicar headers para rotas de API
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=5, s-maxage=5',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Compressão
  compress: true,
  
  // Otimizações de build
  swcMinify: true,
  
  // Configurações de performance
  poweredByHeader: false,
  
  // Otimizações para produção
  ...(process.env.NODE_ENV === 'production' && {
    // Otimizações específicas para produção
    experimental: {
      ...nextConfig.experimental,
      optimizeCss: true,
    },
  }),
};

module.exports = nextConfig; 