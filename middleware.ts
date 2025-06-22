import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Credenciais padrão caso as variáveis de ambiente não estejam definidas
const AUTH_USER = process.env.BASIC_AUTH_USER || 'admin';
const AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'gc2025';

export function middleware(request: NextRequest) {
  // Não aplicar autenticação para a rota da API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === AUTH_USER && pwd === AUTH_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="JSON Generator - Restricted Area"',
    },
  });
}

// Configuração para especificar em quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 