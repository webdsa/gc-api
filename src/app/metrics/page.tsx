import ServerMetrics from "@/components/ServerMetrics";

export default function MetricsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Métricas</h1>
          <p className="text-gray-600 mt-2">Monitoramento em tempo real das APIs PT e ES</p>
        </div>
        
        <ServerMetrics />
      </div>
    </main>
  );
} 