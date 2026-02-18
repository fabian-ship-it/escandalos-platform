import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getScandals,
  getPeople,
  createScandal,
  createPerson,
  linkPersonToScandal,
} from '../api';
import { Scandal, Person } from '../types';

export default function AdminManage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scandals, setScandals] = useState<Scandal[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // New scandal form
  const [showScandalForm, setShowScandalForm] = useState(false);
  const [scandalName, setScandalName] = useState('');
  const [scandalDesc, setScandalDesc] = useState('');
  const [scandalColor, setScandalColor] = useState('#DC2626');

  // New person form
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('');
  const [personDesc, setPersonDesc] = useState('');

  // Link form
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkPersonId, setLinkPersonId] = useState('');
  const [linkScandalId, setLinkScandalId] = useState('');
  const [linkRelationship, setLinkRelationship] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    loadData();
  }, [user]);

  const loadData = () => {
    setLoading(true);
    Promise.all([getScandals(), getPeople()])
      .then(([s, p]) => {
        setScandals(s);
        setPeople(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreateScandal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createScandal({ name: scandalName, description: scandalDesc, color: scandalColor });
      setScandalName('');
      setScandalDesc('');
      setShowScandalForm(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPerson({ name: personName, role_title: personRole, description: personDesc });
      setPersonName('');
      setPersonRole('');
      setPersonDesc('');
      setShowPersonForm(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await linkPersonToScandal(linkPersonId, linkScandalId, linkRelationship);
      setLinkPersonId('');
      setLinkScandalId('');
      setLinkRelationship('');
      setShowLinkForm(false);
      alert('Persona vinculada exitosamente');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-black text-white mb-8">Gestionar Datos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scandals section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Escándalos</h2>
            <button
              onClick={() => setShowScandalForm(!showScandalForm)}
              className="text-sm bg-scandal-accent hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Nuevo
            </button>
          </div>

          {showScandalForm && (
            <form onSubmit={handleCreateScandal} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4e] p-5 mb-4 space-y-3">
              <input
                type="text"
                value={scandalName}
                onChange={(e) => setScandalName(e.target.value)}
                placeholder="Nombre del escándalo"
                className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
                required
              />
              <textarea
                value={scandalDesc}
                onChange={(e) => setScandalDesc(e.target.value)}
                placeholder="Descripción"
                rows={3}
                className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent resize-y"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400">Color:</label>
                <input type="color" value={scandalColor} onChange={(e) => setScandalColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              </div>
              <button type="submit" className="w-full bg-scandal-accent hover:bg-red-700 text-white py-2 rounded-lg text-sm transition-colors">
                Crear Escándalo
              </button>
            </form>
          )}

          <div className="space-y-2">
            {scandals.map((s) => (
              <div key={s.id} className="bg-[#1a1a2e] rounded-lg border border-[#2a2a4e] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium text-white">{s.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* People section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Personas</h2>
            <button
              onClick={() => setShowPersonForm(!showPersonForm)}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Nueva
            </button>
          </div>

          {showPersonForm && (
            <form onSubmit={handleCreatePerson} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4e] p-5 mb-4 space-y-3">
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
                required
              />
              <input
                type="text"
                value={personRole}
                onChange={(e) => setPersonRole(e.target.value)}
                placeholder="Cargo / Rol"
                className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
              />
              <textarea
                value={personDesc}
                onChange={(e) => setPersonDesc(e.target.value)}
                placeholder="Descripción"
                rows={2}
                className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent resize-y"
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors">
                Crear Persona
              </button>
            </form>
          )}

          <div className="space-y-2">
            {people.map((p) => (
              <div key={p.id} className="bg-[#1a1a2e] rounded-lg border border-[#2a2a4e] px-4 py-3">
                <span className="text-sm font-medium text-white">{p.name}</span>
                {p.role_title && <span className="text-xs text-gray-500 ml-2">({p.role_title})</span>}
              </div>
            ))}
            {people.length === 0 && (
              <p className="text-gray-600 text-sm">No hay personas registradas</p>
            )}
          </div>
        </div>
      </div>

      {/* Link section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Vincular Persona a Escándalo</h2>
          <button
            onClick={() => setShowLinkForm(!showLinkForm)}
            className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Vincular
          </button>
        </div>

        {showLinkForm && (
          <form onSubmit={handleLink} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4e] p-5 space-y-3 max-w-lg">
            <select
              value={linkPersonId}
              onChange={(e) => setLinkPersonId(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
              required
            >
              <option value="">Seleccionar persona...</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={linkScandalId}
              onChange={(e) => setLinkScandalId(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
              required
            >
              <option value="">Seleccionar escándalo...</option>
              {scandals.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={linkRelationship}
              onChange={(e) => setLinkRelationship(e.target.value)}
              placeholder="Relación (ej: Contratista, Funcionario, Beneficiario...)"
              className="w-full bg-[#0f0f1a] border border-[#2a2a4e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-scandal-accent"
            />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition-colors">
              Vincular
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
