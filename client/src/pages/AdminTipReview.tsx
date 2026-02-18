import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTip, approveTip, rejectTip, getPeople } from '../api';
import { Tip, Person } from '../types';

export default function AdminTipReview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tip, setTip] = useState<Tip | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [createNewPerson, setCreateNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    if (!id) return;
    Promise.all([getTip(id), getPeople()])
      .then(([t, p]) => {
        setTip(t);
        setPeople(p);
        if (t.person_name_suggestion) {
          setNewPersonName(t.person_name_suggestion);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleApprove = async () => {
    if (!tip) return;
    setSubmitting(true);
    try {
      await approveTip(tip.id, {
        review_note: reviewNote,
        person_id: selectedPerson || undefined,
        create_person: createNewPerson,
        person_name: createNewPerson ? newPersonName : undefined,
        person_role: createNewPerson ? newPersonRole : undefined,
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!tip) return;
    setSubmitting(true);
    try {
      await rejectTip(tip.id, reviewNote);
      navigate('/admin/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-gray-500">Cargando pista...</div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="text-center py-12 text-gray-500">Pista no encontrada</div>
    );
  }

  const isReviewed = tip.status !== 'pending';

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="text-gray-500 hover:text-gray-300 text-sm mb-6 inline-block transition-colors"
      >
        ← Volver al panel
      </button>

      <div className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4e] p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            tip.status === 'pending'
              ? 'text-yellow-400 bg-yellow-400/10 border-yellow-800'
              : tip.status === 'approved'
              ? 'text-green-400 bg-green-400/10 border-green-800'
              : 'text-red-400 bg-red-400/10 border-red-800'
          }`}>
            {tip.status === 'pending' ? 'Pendiente' : tip.status === 'approved' ? 'Aprobada' : 'Rechazada'}
          </span>
          <span className="text-xs text-gray-600">
            {new Date(tip.submitted_at).toLocaleString('es-CO')}
          </span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Pista sobre: {tip.scandal_name}</h2>
        {tip.person_name_suggestion && (
          <p className="text-sm text-scandal-gold mb-4">
            Persona sugerida: {tip.person_name_suggestion}
          </p>
        )}

        <div className="bg-[#0f0f1a] rounded-lg p-5 mb-6 border border-[#2a2a4e]">
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{tip.description}</p>
        </div>

        {/* Files */}
        {tip.files && tip.files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Archivos adjuntos ({tip.files.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {tip.files.map((file) => (
                <a
                  key={file.id}
                  href={`/uploads/${file.stored_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-4 py-3 hover:border-scandal-accent transition-colors no-underline"
                >
                  <span className="text-xl">
                    {file.mime_type.startsWith('image/') ? '🖼️' : '📄'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 truncate">{file.original_name}</p>
                    <p className="text-xs text-gray-600">
                      {(file.size_bytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {!isReviewed && (
          <>
            <hr className="border-[#2a2a4e] my-6" />

            {/* Person assignment */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Vincular a persona</h3>
              <div className="space-y-3">
                <select
                  value={selectedPerson}
                  onChange={(e) => {
                    setSelectedPerson(e.target.value);
                    if (e.target.value) setCreateNewPerson(false);
                  }}
                  className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-scandal-accent"
                >
                  <option value="">Seleccionar persona existente...</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.role_title ? `(${p.role_title})` : ''}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createNewPerson}
                    onChange={(e) => {
                      setCreateNewPerson(e.target.checked);
                      if (e.target.checked) setSelectedPerson('');
                    }}
                    className="rounded"
                  />
                  Crear nueva persona
                </label>

                {createNewPerson && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <input
                      type="text"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="Nombre completo"
                      className="bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
                    />
                    <input
                      type="text"
                      value={newPersonRole}
                      onChange={(e) => setNewPersonRole(e.target.value)}
                      placeholder="Cargo / Rol"
                      className="bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Review note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nota de revisión (interna)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                placeholder="Notas internas sobre esta pista..."
                className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-scandal-accent resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {submitting ? 'Procesando...' : 'Aprobar y Publicar'}
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 bg-red-900/50 hover:bg-red-900 border border-red-800 disabled:opacity-50 text-red-400 py-3 rounded-lg font-medium transition-colors"
              >
                Rechazar
              </button>
            </div>
          </>
        )}

        {isReviewed && tip.review_note && (
          <div className="mt-4 bg-[#0f0f1a] rounded-lg p-4 border border-[#2a2a4e]">
            <p className="text-xs text-gray-500 mb-1">Nota de revisión:</p>
            <p className="text-sm text-gray-400">{tip.review_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
