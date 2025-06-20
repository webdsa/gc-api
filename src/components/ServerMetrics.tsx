'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ServerMetrics {
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      external: number;
      rss: number;
    };
    cpu: {
      user: number;
      system: number;
    };
  };
  apis: {
    pt: {
      totalRequests: number;
      totalErrors: number;
      requestsPerMinute: number;
      averageResponseTime: number;
      errorRate: number;
    };
    es: {
      totalRequests: number;
      totalErrors: number;
      requestsPerMinute: number;
      averageResponseTime: number;
      errorRate: number;
    };
  };
  performance: {
    totalRequests: number;
    totalErrors: number;
    totalRequestsPerMinute: number;
    errorRate: number;
    lastResponseTime: number;
  };
  timestamp: string;
}

export default function ServerMetrics() {
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<{
    labels: string[];
    ptResponseTimes: number[];
    esResponseTimes: number[];
    ptRequestsPerMinute: number[];
    esRequestsPerMinute: number[];
  }>({
    labels: [],
    ptResponseTimes: [],
    esResponseTimes: [],
    ptRequestsPerMinute: [],
    esRequestsPerMinute: [],
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
          
          // Adicionar dados históricos
          const now = new Date().toLocaleTimeString();
          setHistoricalData(prev => ({
            labels: [...prev.labels.slice(-19), now], // Manter últimos 20 pontos
            ptResponseTimes: [...prev.ptResponseTimes.slice(-19), data.apis.pt.averageResponseTime],
            esResponseTimes: [...prev.esResponseTimes.slice(-19), data.apis.es.averageResponseTime],
            ptRequestsPerMinute: [...prev.ptRequestsPerMinute.slice(-19), data.apis.pt.requestsPerMinute],
            esRequestsPerMinute: [...prev.esRequestsPerMinute.slice(-19), data.apis.es.requestsPerMinute],
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      }
    };

    // Buscar métricas imediatamente
    fetchMetrics();

    // Configurar intervalo para atualizar a cada 5 segundos
    intervalRef.current = setInterval(fetchMetrics, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!metrics) {
    return (
      <div className="w-full max-w-5xl bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Métricas das APIs PT e ES</h2>
        <div className="text-center py-8">Carregando métricas...</div>
      </div>
    );
  }

  const responseTimeChartData = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'API PT - Tempo de Resposta (ms)',
        data: historicalData.ptResponseTimes,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'API ES - Tempo de Resposta (ms)',
        data: historicalData.esResponseTimes,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const requestsChartData = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'API PT - Requisições/min',
        data: historicalData.ptRequestsPerMinute,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'API ES - Requisições/min',
        data: historicalData.esRequestsPerMinute,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const requestsDistributionData = {
    labels: ['API PT', 'API ES'],
    datasets: [
      {
        data: [metrics.apis.pt.totalRequests, metrics.apis.es.totalRequests],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Métricas das APIs PT e ES</h2>
      
      {/* Cards de métricas por API */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* API PT */}
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">API Português (PT)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Total Requisições</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.apis.pt.totalRequests}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Req/min</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.apis.pt.requestsPerMinute}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Tempo Médio (ms)</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.apis.pt.averageResponseTime}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Taxa de Erro (%)</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.apis.pt.errorRate}%</p>
            </div>
          </div>
        </div>

        {/* API ES */}
        <div className="bg-red-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4 text-red-800">API Español (ES)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-red-600">Total Requisições</p>
              <p className="text-2xl font-bold text-red-900">{metrics.apis.es.totalRequests}</p>
            </div>
            <div>
              <p className="text-sm text-red-600">Req/min</p>
              <p className="text-2xl font-bold text-red-900">{metrics.apis.es.requestsPerMinute}</p>
            </div>
            <div>
              <p className="text-sm text-red-600">Tempo Médio (ms)</p>
              <p className="text-2xl font-bold text-red-900">{metrics.apis.es.averageResponseTime}</p>
            </div>
            <div>
              <p className="text-sm text-red-600">Taxa de Erro (%)</p>
              <p className="text-2xl font-bold text-red-900">{metrics.apis.es.errorRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tempo de resposta */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Tempo de Resposta por API</h3>
          <Line data={responseTimeChartData} options={chartOptions} />
        </div>

        {/* Gráfico de requisições por minuto */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Requisições por Minuto por API</h3>
          <Line data={requestsChartData} options={chartOptions} />
        </div>
      </div>

      {/* Gráfico de distribuição de requisições */}
      <div className="mt-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Requisições</h3>
          <div className="flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut data={requestsDistributionData} options={doughnutOptions} />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Total: {metrics.performance.totalRequests} requisições
            </p>
          </div>
        </div>
      </div>

      {/* Resumo geral */}
      <div className="mt-6 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Requisições</p>
            <p className="text-lg font-bold">{metrics.performance.totalRequests}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Erros</p>
            <p className="text-lg font-bold">{metrics.performance.totalErrors}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Req/min Total</p>
            <p className="text-lg font-bold">{metrics.performance.totalRequestsPerMinute}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taxa de Erro Geral</p>
            <p className="text-lg font-bold">{metrics.performance.errorRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
} 