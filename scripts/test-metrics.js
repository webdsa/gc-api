const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisição
const makeRequest = (endpoint) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
};

// Função para obter métricas
const getMetrics = async () => {
  try {
    const response = await makeRequest('/api/metrics');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    return null;
  }
};

// Teste principal
const runTest = async () => {
  console.log('🧪 Testando métricas...\n');
  
  // 1. Obter métricas iniciais
  console.log('1. Métricas iniciais:');
  let metrics = await getMetrics();
  console.log('   PT Requests:', metrics.apis.pt.totalRequests);
  console.log('   ES Requests:', metrics.apis.es.totalRequests);
  console.log('   PT Errors:', metrics.apis.pt.totalErrors);
  console.log('   ES Errors:', metrics.apis.es.totalErrors);
  console.log('');
  
  // 2. Fazer algumas requisições
  console.log('2. Fazendo requisições de teste...');
  
  // Requisições PT
  console.log('   Fazendo 3 requisições para /api/live/pt...');
  for (let i = 0; i < 3; i++) {
    await makeRequest('/api/live/pt');
    console.log(`   Requisição PT ${i + 1} concluída`);
  }
  
  // Requisições ES
  console.log('   Fazendo 2 requisições para /api/live/es...');
  for (let i = 0; i < 2; i++) {
    await makeRequest('/api/live/es');
    console.log(`   Requisição ES ${i + 1} concluída`);
  }
  
  console.log('');
  
  // 3. Aguardar um pouco
  console.log('3. Aguardando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('');
  
  // 4. Obter métricas finais
  console.log('4. Métricas finais:');
  metrics = await getMetrics();
  console.log('   PT Requests:', metrics.apis.pt.totalRequests);
  console.log('   ES Requests:', metrics.apis.es.totalRequests);
  console.log('   PT Errors:', metrics.apis.pt.totalErrors);
  console.log('   ES Errors:', metrics.apis.es.totalErrors);
  console.log('   PT Avg Response Time:', metrics.apis.pt.averageResponseTime + 'ms');
  console.log('   ES Avg Response Time:', metrics.apis.es.averageResponseTime + 'ms');
  console.log('   PT Requests/min:', metrics.apis.pt.requestsPerMinute);
  console.log('   ES Requests/min:', metrics.apis.es.requestsPerMinute);
  console.log('');
  
  // 5. Verificar se funcionou
  if (metrics.apis.pt.totalRequests >= 3 && metrics.apis.es.totalRequests >= 2) {
    console.log('✅ Métricas funcionando corretamente!');
    console.log('   - Requisições PT registradas:', metrics.apis.pt.totalRequests);
    console.log('   - Requisições ES registradas:', metrics.apis.es.totalRequests);
  } else {
    console.log('❌ Métricas não estão funcionando!');
    console.log('   - Esperado: PT >= 3, ES >= 2');
    console.log('   - Obtido: PT =', metrics.apis.pt.totalRequests, ', ES =', metrics.apis.es.totalRequests);
  }
};

// Executar teste
runTest().catch(console.error); 