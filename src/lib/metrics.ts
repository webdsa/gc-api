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
  const beforeCount = metrics[endpoint].responseTimes.length;
  metrics[endpoint].responseTimes = metrics[endpoint].responseTimes.filter(time => time > oneMinuteAgo);
  const afterCount = metrics[endpoint].responseTimes.length;
  
  if (beforeCount !== afterCount) {
    console.log(`🧹 Limpeza ${endpoint}: ${beforeCount} → ${afterCount} registros`);
  }
};

// Função para registrar requisição PT
export const recordPTRequest = (responseTime: number) => {
  metrics.pt.requests++;
  metrics.pt.responseTimes.push(Date.now()); // Usar timestamp em vez do tempo de resposta
  console.log(`📊 PT Request registrada: ${metrics.pt.requests} total, tempo: ${responseTime}ms`);
};

// Função para registrar requisição ES
export const recordESRequest = (responseTime: number) => {
  metrics.es.requests++;
  metrics.es.responseTimes.push(Date.now()); // Usar timestamp em vez do tempo de resposta
  console.log(`📊 ES Request registrada: ${metrics.es.requests} total, tempo: ${responseTime}ms`);
};

// Função para registrar erro PT
export const recordPTError = () => {
  metrics.pt.errors++;
  console.log(`❌ PT Error registrado: ${metrics.pt.errors} total`);
};

// Função para registrar erro ES
export const recordESError = () => {
  metrics.es.errors++;
  console.log(`❌ ES Error registrado: ${metrics.es.errors} total`);
};

// Função para obter métricas (para uso interno)
export const getMetrics = () => {
  cleanupOldMetrics('pt');
  cleanupOldMetrics('es');
  
  // Calcular tempos médios de resposta (simulado por enquanto)
  const ptAvgResponseTime = metrics.pt.responseTimes.length > 0 ? 50 : 0; // Simulado
  const esAvgResponseTime = metrics.es.responseTimes.length > 0 ? 45 : 0; // Simulado
  
  return {
    ...metrics,
    pt: {
      ...metrics.pt,
      averageResponseTime: ptAvgResponseTime,
    },
    es: {
      ...metrics.es,
      averageResponseTime: esAvgResponseTime,
    },
  };
};

// Função para limpar métricas antigas
export const cleanupMetrics = () => {
  cleanupOldMetrics('pt');
  cleanupOldMetrics('es');
};

// Função para resetar métricas (útil para testes)
export const resetMetrics = () => {
  metrics = {
    pt: {
      requests: 0,
      errors: 0,
      responseTimes: [],
    },
    es: {
      requests: 0,
      errors: 0,
      responseTimes: [],
    },
    startTime: Date.now(),
  };
  console.log('🔄 Métricas resetadas');
}; 