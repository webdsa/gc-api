const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = ['/api/live/pt', '/api/live/es'];
const INTERVAL = 5000; // 5 segundos
const TEST_DURATION = 60000; // 1 minuto de teste

let requestCount = 0;
let successCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

const makeRequest = (endpoint) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(`${BASE_URL}${endpoint}`, (res) => {
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        requestCount++;
        if (res.statusCode === 200) {
          successCount++;
          console.log(`✅ ${endpoint} - ${res.statusCode} - ${responseTime}ms`);
        } else {
          errorCount++;
          console.log(`❌ ${endpoint} - ${res.statusCode} - ${responseTime}ms`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;
      requestCount++;
      errorCount++;
      console.log(`❌ ${endpoint} - ERROR - ${responseTime}ms - ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;
      requestCount++;
      errorCount++;
      console.log(`⏰ ${endpoint} - TIMEOUT - ${responseTime}ms`);
      resolve();
    });
  });
};

const runLoadTest = async () => {
  console.log('🚀 Iniciando teste de carga...');
  console.log(`📊 Testando endpoints: ${ENDPOINTS.join(', ')}`);
  console.log(`⏱️  Intervalo: ${INTERVAL}ms`);
  console.log(`⏰ Duração: ${TEST_DURATION}ms`);
  console.log('─'.repeat(50));
  
  const startTime = Date.now();
  
  const interval = setInterval(async () => {
    const promises = ENDPOINTS.map(endpoint => makeRequest(endpoint));
    await Promise.all(promises);
    
    // Verificar se o teste terminou
    if (Date.now() - startTime >= TEST_DURATION) {
      clearInterval(interval);
      
      const avgResponseTime = totalResponseTime / requestCount;
      const successRate = (successCount / requestCount) * 100;
      
      console.log('─'.repeat(50));
      console.log('📊 RESULTADOS DO TESTE:');
      console.log(`Total de requisições: ${requestCount}`);
      console.log(`Sucessos: ${successCount}`);
      console.log(`Erros: ${errorCount}`);
      console.log(`Taxa de sucesso: ${successRate.toFixed(2)}%`);
      console.log(`Tempo médio de resposta: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`Requisições por segundo: ${(requestCount / (TEST_DURATION / 1000)).toFixed(2)}`);
      
      if (successRate >= 95) {
        console.log('✅ APIs prontas para produção!');
      } else {
        console.log('⚠️  APIs precisam de otimização.');
      }
      
      process.exit(0);
    }
  }, INTERVAL);
};

// Executar teste
runLoadTest().catch(console.error); 