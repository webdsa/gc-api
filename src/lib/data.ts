import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'live-data.json');

// Cache em memória para melhorar performance
let cache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 1000; // 1 segundo de cache

// Dados em memória para produção (Vercel)
let memoryData: any = {
  pt: {
    enabled: false,
    title: "",
    videoID: "",
    description: "",
  },
  es: {
    enabled: false,
    title: "",
    videoID: "",
    description: "",
  },
};

// Detectar se estamos em produção (Vercel)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Garantir que o diretório existe (apenas para desenvolvimento)
const ensureDataDir = async () => {
  if (isProduction) return; // Não criar diretórios em produção
  
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Carregar dados do arquivo (apenas para desenvolvimento)
const loadDataFromFile = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existe, retornar dados padrão
    return {
      pt: {
        enabled: false,
        title: "",
        videoID: "",
        description: "",
      },
      es: {
        enabled: false,
        title: "",
        videoID: "",
        description: "",
      },
    };
  }
};

// Salvar dados no arquivo (apenas para desenvolvimento)
const saveDataToFile = async (data: any) => {
  if (isProduction) return; // Não salvar arquivos em produção
  
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Função para obter dados com cache
const getCachedData = async () => {
  const now = Date.now();
  
  // Se cache é válido, retornar cache
  if (cache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return cache;
  }
  
  // Carregar dados baseado no ambiente
  if (isProduction) {
    // Em produção, usar dados em memória
    cache = { ...memoryData };
  } else {
    // Em desenvolvimento, carregar do arquivo
    cache = await loadDataFromFile();
  }
  
  lastCacheUpdate = now;
  return cache;
};

export const getLiveData = async (lang: 'pt' | 'es') => {
  const data = await getCachedData();
  return data[lang];
};

export const updateLiveData = async (lang: 'pt' | 'es', newData: any) => {
  const data = await getCachedData();
  data[lang] = { ...data[lang], ...newData };
  
  if (isProduction) {
    // Em produção, atualizar dados em memória
    memoryData = { ...data };
    console.log(`📝 Dados ${lang} atualizados em memória:`, newData);
  } else {
    // Em desenvolvimento, salvar no arquivo
    await saveDataToFile(data);
    console.log(`📝 Dados ${lang} salvos no arquivo:`, newData);
  }
  
  // Invalidar cache após salvar
  cache = null;
  lastCacheUpdate = 0;
  
  return data[lang];
};

export const getAllLiveData = async () => {
  return await getCachedData();
};

// Função para limpar cache (útil para testes)
export const clearCache = () => {
  cache = null;
  lastCacheUpdate = 0;
};

// Função para obter dados em memória (útil para debug)
export const getMemoryData = () => {
  return isProduction ? memoryData : null;
}; 