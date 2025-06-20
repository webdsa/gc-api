import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'live-data.json');

// Cache em memória para melhorar performance
let cache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 1000; // 1 segundo de cache

// Garantir que o diretório existe
const ensureDataDir = async () => {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Carregar dados do arquivo
const loadData = async () => {
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

// Salvar dados no arquivo
const saveData = async (data: any) => {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  // Invalidar cache após salvar
  cache = null;
  lastCacheUpdate = 0;
};

// Função para obter dados com cache
const getCachedData = async () => {
  const now = Date.now();
  
  // Se cache é válido, retornar cache
  if (cache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return cache;
  }
  
  // Carregar dados do arquivo
  cache = await loadData();
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
  await saveData(data);
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