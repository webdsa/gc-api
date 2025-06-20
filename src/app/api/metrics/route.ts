import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';
import { getMetrics } from '@/lib/metrics';

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
          requestsPerSecond: metrics.pt.requestsPerSecond,
          averageResponseTime: metrics.pt.averageResponseTime,
          errorRate: metrics.pt.requests > 0 ? Math.round((metrics.pt.errors / metrics.pt.requests) * 100 * 100) / 100 : 0,
        },
        es: {
          totalRequests: metrics.es.requests,
          totalErrors: metrics.es.errors,
          requestsPerSecond: metrics.es.requestsPerSecond,
          averageResponseTime: metrics.es.averageResponseTime,
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
    console.error('Erro ao coletar métricas:', error);
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    );
  }
} 