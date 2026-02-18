import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScandals } from '../api';
import { Scandal } from '../types';

export default function HomePage() {
  const [scandals, setScandals] = useState<Scandal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScandals()
      .then(setScandals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-pulse text-gray-500 text-lg">Cargando escándalos...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-3">
          <span className="text-scandal-accent">Investigaciones</span>{' '}
          <span className="text-scandal-gold">Abiertas</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Plataforma ciudadana para documentar y conectar actores en escándalos de interés público.
          Cada caso tiene un tablero interactivo donde se visualizan las conexiones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scandals.map((scandal) => (
          <Link
            key={scandal.id}
            to={`/scandal/${scandal.id}`}
            className="group block bg-[#1a1a2e] rounded-xl border border-[#2a2a4e] hover:border-scandal-accent transition-all duration-300 overflow-hidden no-underline"
          >
            <div className="h-2" style={{ backgroundColor: scandal.color }} />
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-scandal-accent transition-colors">
                {scandal.name}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                {scandal.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>Ver tablero de conexiones →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          to="/submit"
          className="inline-flex items-center gap-2 bg-scandal-accent hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors no-underline"
        >
          Enviar una Pista Anónima
        </Link>
        <p className="text-gray-600 text-sm mt-3">
          Tu identidad permanece completamente anónima. No se registran datos personales.
        </p>
      </div>
    </div>
  );
}
