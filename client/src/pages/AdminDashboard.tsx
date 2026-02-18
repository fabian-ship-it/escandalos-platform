import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTips, getScandals } from '../api';
import { Tip, Scandal } from '../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>([]);
  const [scandals, setScandals] = useState<Scandal[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    Promise.all([getTips(filter), getScandals()])
      .then(([t, s]) => {
        setTips(t);
        setScandals(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, filter]);

  if (!user) return null;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-800' },
    approved: { label: 'Aprobada', color: 'text-green-400 bg-green-400/10 border-green-800' },
    rejected: { label: 'Rechazada', color: 'text-red-400 bg-red-400/10 border-red-800' },
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Panel de Verificación</h1>
          <p className="text-gray-500 text-sm mt-1">Revisa y aprueba pistas anónimas</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-lg border border-[#2a2a4e] p-1">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filter === f ? 'bg-[#2a2a4e] text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : f === 'rejected' ? 'Rechazadas' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12 animate-pulse">Cargando pistas...</div>
      ) : tips.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-[#1a1a2e] rounded-xl border border-[#2a2a4e]">
          <p className="text-lg mb-1">No hay pistas {filter === 'pending' ? 'pendientes' : ''}</p>
          <p className="text-sm text-gray-600">Las pistas anónimas aparecerán aquí cuando sean enviadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => {
            const status = statusLabels[tip.status] || statusLabels.pending;
            return (
              <Link
                key={tip.id}
                to={`/admin/tips/${tip.id}`}
                className="block bg-[#1a1a2e] rounded-xl border border-[#2a2a4e] hover:border-scandal-accent transition-colors p-5 no-underline"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(tip.submitted_at).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">{tip.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Caso: <span className="text-gray-400">{tip.scandal_name}</span></span>
                      {tip.person_name_suggestion && (
                        <span>Persona: <span className="text-gray-400">{tip.person_name_suggestion}</span></span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-600 text-sm">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
