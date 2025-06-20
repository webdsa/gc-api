const BASE_URL = 'http://localhost:3000';

async function testMetrics() {
  console.log('🧪 Testando métricas PT vs ES...\n');

  // Testar endpoint PT
  console.log('📊 Testando endpoint PT...');
  try {
    const ptResponse = await fetch(`${BASE_URL}/api/live/pt`);
    const ptData = await ptResponse.json();
    console.log('✅ PT Response:', ptResponse.status, ptData.acf ? 'Dados encontrados' : 'Sem dados');
  } catch (error) {
    console.log('❌ PT Error:', error.message);
  }

  // Testar endpoint ES
  console.log('\n📊 Testando endpoint ES...');
  try {
    const esResponse = await fetch(`${BASE_URL}/api/live/es`);
    const esData = await esResponse.json();
    console.log('✅ ES Response:', esResponse.status, esData.acf ? 'Dados encontrados' : 'Sem dados');
  } catch (error) {
    console.log('❌ ES Error:', error.message);
  }

  // Verificar métricas
  console.log('\n📈 Verificando métricas...');
  try {
    const metricsResponse = await fetch(`${BASE_URL}/api/metrics`);
    const metrics = await metricsResponse.json();
    
    console.log('📊 Métricas PT:');
    console.log(`  - Total requests: ${metrics.apis.pt.totalRequests}`);
    console.log(`  - Total errors: ${metrics.apis.pt.totalErrors}`);
    console.log(`  - Requests per second: ${metrics.apis.pt.requestsPerSecond}`);
    console.log(`  - Average response time: ${metrics.apis.pt.averageResponseTime}ms`);
    console.log(`  - Error rate: ${metrics.apis.pt.errorRate}%`);

    console.log('\n📊 Métricas ES:');
    console.log(`  - Total requests: ${metrics.apis.es.totalRequests}`);
    console.log(`  - Total errors: ${metrics.apis.es.totalErrors}`);
    console.log(`  - Requests per second: ${metrics.apis.es.requestsPerSecond}`);
    console.log(`  - Average response time: ${metrics.apis.es.averageResponseTime}ms`);
    console.log(`  - Error rate: ${metrics.apis.es.errorRate}%`);

  } catch (error) {
    console.log('❌ Erro ao buscar métricas:', error.message);
  }
}

// Executar teste
testMetrics().catch(console.error); 