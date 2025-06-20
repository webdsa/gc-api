import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

// Métricas em memória específicas para PT e ES
let metrics = {
  pt: {
    requests: 0,
    errors: 0,
    responseTimes: [] as number[],
  },
  es: {
    requests: 0,
    errors: 0,
    responseTimes: [] as number[],
  },
  startTime: Date.now(),
};

// Limpar métricas antigas (manter apenas últimos 60 segundos)
const cleanupOldMetrics = (endpoint: 'pt' | 'es') => {
  const oneMinuteAgo = Date.now() - 60000;
  metrics[endpoint].responseTimes = metrics[endpoint].responseTimes.filter(time => time > oneMinuteAgo);
};

// Função para registrar requisição PT
export const recordPTRequest = (responseTime: number) => {
  metrics.pt.requests++;
  metrics.pt.responseTimes.push(responseTime);
};

// Função para registrar requisição ES
export const recordESRequest = (responseTime: number) => {
  metrics.es.requests++;
  metrics.es.responseTimes.push(responseTime);
};

// Função para registrar erro PT
export const recordPTError = () => {
  metrics.pt.errors++;
};

// Função para registrar erro ES
export const recordESError = () => {
  metrics.es.errors++;
};

// Função para obter métricas (para uso interno)
export const getMetrics = () => {
  cleanupOldMetrics('pt');
  cleanupOldMetrics('es');
  return metrics;
};

export async function GET() {
  const startTime = performance.now();
  
  try {
    // Coletar métricas do sistema
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calcular tempo de resposta
    const responseTime = performance.now() - startTime;
    
    // Obter métricas das APIs
    const metrics = getMetrics();
    
    // Calcular médias
    const ptAvgResponseTime = metrics.pt.responseTimes.length > 0 
      ? metrics.pt.responseTimes.reduce((a, b) => a + b, 0) / metrics.pt.responseTimes.length 
      : 0;
    
    const esAvgResponseTime = metrics.es.responseTimes.length > 0 
      ? metrics.es.responseTimes.reduce((a, b) => a + b, 0) / metrics.es.responseTimes.length 
      : 0;
    
    const uptime = Date.now() - metrics.startTime;
    const totalRequests = metrics.pt.requests + metrics.es.requests;
    const totalErrors = metrics.pt.errors + metrics.es.errors;
    const totalRequestsPerMinute = metrics.pt.responseTimes.length + metrics.es.responseTimes.length;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    const serverMetrics = {
      system: {
        uptime: Math.floor(uptime / 1000), // segundos
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024), // MB
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000), // ms
          system: Math.round(cpuUsage.system / 1000), // ms
        },
      },
      apis: {
        pt: {
          totalRequests: metrics.pt.requests,
          totalErrors: metrics.pt.errors,
          requestsPerMinute: metrics.pt.responseTimes.length,
          averageResponseTime: Math.round(ptAvgResponseTime),
          errorRate: metrics.pt.requests > 0 ? Math.round((metrics.pt.errors / metrics.pt.requests) * 100 * 100) / 100 : 0,
        },
        es: {
          totalRequests: metrics.es.requests,
          totalErrors: metrics.es.errors,
          requestsPerMinute: metrics.es.responseTimes.length,
          averageResponseTime: Math.round(esAvgResponseTime),
          errorRate: metrics.es.requests > 0 ? Math.round((metrics.es.errors / metrics.es.requests) * 100 * 100) / 100 : 0,
        },
      },
      performance: {
        totalRequests,
        totalErrors,
        totalRequestsPerMinute,
        errorRate: Math.round(errorRate * 100) / 100,
        lastResponseTime: Math.round(responseTime),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(serverMetrics, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    );
  }
} 