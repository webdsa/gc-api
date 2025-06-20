console.log('🔍 Verificando variáveis de ambiente...\n');

const requiredVars = [
  'POSTGRES_URL',
  'NODE_ENV',
  'VERCEL'
];

const optionalVars = [
  'POSTGRES_HOST',
  'POSTGRES_DATABASE',
  'POSTGRES_USERNAME',
  'POSTGRES_PASSWORD'
];

console.log('📋 Variáveis obrigatórias:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: Não definida`);
  }
});

console.log('\n📋 Variáveis opcionais:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`⚠️ ${varName}: Não definida (opcional)`);
  }
});

console.log('\n🔍 Análise:');
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const hasPostgresUrl = !!process.env.POSTGRES_URL;

console.log(`- Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'}`);
console.log(`- POSTGRES_URL: ${hasPostgresUrl ? 'Configurada' : 'Não configurada'}`);

if (isProduction && !hasPostgresUrl) {
  console.log('\n❌ PROBLEMA: Em produção sem POSTGRES_URL!');
  console.log('💡 Solução: Configure POSTGRES_URL no Vercel Dashboard');
  console.log('   Vercel Dashboard > Settings > Environment Variables');
} else if (isProduction && hasPostgresUrl) {
  console.log('\n✅ Configuração OK para produção');
} else if (!isProduction && !hasPostgresUrl) {
  console.log('\n⚠️ Desenvolvimento sem POSTGRES_URL - usando arquivo local');
} else {
  console.log('\n✅ Configuração OK');
}

console.log('\n📝 Próximos passos:');
if (!hasPostgresUrl) {
  console.log('1. Crie um projeto no Neon (neon.tech)');
  console.log('2. Copie a connection string');
  console.log('3. Configure POSTGRES_URL no Vercel Dashboard');
  console.log('4. Ou crie um arquivo .env.local localmente');
} 