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

// Função para limpar métricas antigas
export const cleanupMetrics = () => {
  cleanupOldMetrics('pt');
  cleanupOldMetrics('es');
}; 