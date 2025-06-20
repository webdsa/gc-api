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
        // Headers padrão para outras rotas de API
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
      {
        // Headers específicos para rotas de live data (sem cache) - sobrescreve o padrão
        source: '/api/live/pt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
      {
        // Headers específicos para rotas de live data (sem cache) - sobrescreve o padrão
        source: '/api/live/es',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
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
};

module.exports = nextConfig; 