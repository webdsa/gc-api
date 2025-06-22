import JsonManager from './components/JsonManager';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        JSON Generator
      </h1>
      <JsonManager />
    </main>
  );
}
