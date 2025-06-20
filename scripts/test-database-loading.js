const { sql } = require('@vercel/postgres');

async function testDatabaseLoading() {
  console.log('🧪 Testando carregamento de dados do banco...');
  
  try {
    // Testar conexão
    console.log('1. Testando conexão...');
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('✅ Conexão OK:', connectionTest.rows[0]);
    
    // Verificar se a tabela existe
    console.log('\n2. Verificando estrutura da tabela...');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'live_data' 
      ORDER BY ordinal_position
    `;
    
    if (tableInfo.rows.length === 0) {
      console.log('❌ Tabela live_data não existe!');
      return;
    }
    
    console.log('✅ Estrutura da tabela:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar dados atuais
    console.log('\n3. Dados atuais no banco:');
    const currentData = await sql`
      SELECT language, enabled, title, video_id, description, updated_at
      FROM live_data 
      ORDER BY language
    `;
    
    if (currentData.rows.length === 0) {
      console.log('⚠️ Nenhum dado encontrado na tabela');
    } else {
      console.log('📊 Dados encontrados:', currentData.rows.length, 'registros');
      currentData.rows.forEach(row => {
        console.log(`  ${row.language}: enabled=${row.enabled}, title="${row.title}", video_id="${row.video_id}"`);
      });
    }
    
    // Testar inserção de dados de exemplo se não existirem
    console.log('\n4. Verificando dados de exemplo...');
    const ptData = await sql`SELECT * FROM live_data WHERE language = 'pt'`;
    const esData = await sql`SELECT * FROM live_data WHERE language = 'es'`;
    
    if (ptData.rows.length === 0) {
      console.log('📝 Inserindo dados de exemplo para PT...');
      await sql`
        INSERT INTO live_data (language, enabled, title, video_id, description) 
        VALUES ('pt', true, 'Live em Português', 'pt_video_123', 'Descrição da live em português')
      `;
      console.log('✅ Dados PT inseridos');
    }
    
    if (esData.rows.length === 0) {
      console.log('📝 Inserindo dados de exemplo para ES...');
      await sql`
        INSERT INTO live_data (language, enabled, title, video_id, description) 
        VALUES ('es', true, 'Live en Español', 'es_video_456', 'Descripción de la live en español')
      `;
      console.log('✅ Dados ES inseridos');
    }
    
    // Verificar dados finais
    console.log('\n5. Dados finais no banco:');
    const finalData = await sql`
      SELECT language, enabled, title, video_id, description, updated_at
      FROM live_data 
      ORDER BY language
    `;
    
    console.log('📊 Dados finais:', JSON.stringify(finalData.rows, null, 2));
    
    console.log('\n🎉 Teste de carregamento concluído com sucesso!');
    console.log('\n💡 Para testar no frontend:');
    console.log('1. Acesse a aplicação');
    console.log('2. Clique em "🔄 Recarregar Dados"');
    console.log('3. Verifique se os dados aparecem no formulário');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
}

// Executar teste
testDatabaseLoading(); 