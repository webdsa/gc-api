import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // Criar tabela se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS live_data (
        id SERIAL PRIMARY KEY,
        language VARCHAR(2) NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT false,
        title TEXT,
        video_id TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Inserir dados iniciais se não existirem
    await sql`
      INSERT INTO live_data (language, enabled, title, video_id, description) 
      VALUES 
        ('pt', false, '', '', ''),
        ('es', false, '', '', '')
      ON CONFLICT (language) DO NOTHING
    `;

    console.log('✅ Database inicializada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar database:', error);
    throw error;
  }
}

export async function getLiveDataFromDB(lang: 'pt' | 'es') {
  try {
    const result = await sql`
      SELECT enabled, title, video_id, description 
      FROM live_data 
      WHERE language = ${lang}
    `;
    
    if (result.rows.length === 0) {
      return {
        enabled: false,
        title: "",
        videoID: "",
        description: "",
      };
    }
    
    const row = result.rows[0];
    return {
      enabled: row.enabled,
      title: row.title || "",
      videoID: row.video_id || "",
      description: row.description || "",
    };
  } catch (error) {
    console.error(`❌ Erro ao carregar dados ${lang} do banco:`, error);
    // Retornar dados padrão em caso de erro
    return {
      enabled: false,
      title: "",
      videoID: "",
      description: "",
    };
  }
}

export async function updateLiveDataInDB(lang: 'pt' | 'es', data: any) {
  try {
    console.log(`📝 Iniciando UPDATE no banco para ${lang}:`, {
      enabled: data.enabled || false,
      title: data.title || '',
      videoID: data.videoID || '',
      description: data.description || ''
    });
    
    const result = await sql`
      UPDATE live_data 
      SET 
        enabled = ${data.enabled || false},
        title = ${data.title || ''},
        video_id = ${data.videoID || ''},
        description = ${data.description || ''},
        updated_at = NOW()
      WHERE language = ${lang}
      RETURNING *
    `;
    
    console.log(`✅ UPDATE executado para ${lang}. Linhas afetadas:`, result.rowCount);
    console.log(`📊 Dados retornados do UPDATE:`, result.rows[0]);
    
    if (result.rowCount === 0) {
      console.warn(`⚠️ Nenhuma linha foi atualizada para ${lang}. Verificando se o registro existe...`);
      
      // Verificar se o registro existe
      const checkResult = await sql`
        SELECT language FROM live_data WHERE language = ${lang}
      `;
      
      if (checkResult.rows.length === 0) {
        console.log(`📝 Registro ${lang} não existe. Criando...`);
        await sql`
          INSERT INTO live_data (language, enabled, title, video_id, description) 
          VALUES (${lang}, ${data.enabled || false}, ${data.title || ''}, ${data.videoID || ''}, ${data.description || ''})
        `;
        console.log(`✅ Registro ${lang} criado com sucesso`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar dados ${lang} no banco:`, error);
    console.error('Detalhes do erro:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      detail: (error as any)?.detail,
      hint: (error as any)?.hint
    });
    throw error;
  }
}

export async function getAllLiveDataFromDB() {
  try {
    const result = await sql`
      SELECT language, enabled, title, video_id, description 
      FROM live_data 
      ORDER BY language
    `;
    
    const data: any = {
      pt: { enabled: false, title: "", videoID: "", description: "" },
      es: { enabled: false, title: "", videoID: "", description: "" },
    };
    
    result.rows.forEach(row => {
      const lang = row.language as 'pt' | 'es';
      data[lang] = {
        enabled: row.enabled,
        title: row.title || "",
        videoID: row.video_id || "",
        description: row.description || "",
      };
    });
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar todos os dados do banco:', error);
    // Retornar dados padrão em caso de erro
    return {
      pt: { enabled: false, title: "", videoID: "", description: "" },
      es: { enabled: false, title: "", videoID: "", description: "" },
    };
  }
}

export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Erro na conexão com o banco:', error);
    return false;
  }
} 