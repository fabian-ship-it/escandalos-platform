import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { getScandals, submitTip } from '../api';
import { Scandal } from '../types';

export default function SubmitTip() {
  const [searchParams] = useSearchParams();
  const preselectedScandal = searchParams.get('scandal') || '';

  const [scandals, setScandals] = useState<Scandal[]>([]);
  const [scandalId, setScandalId] = useState(preselectedScandal);
  const [description, setDescription] = useState('');
  const [personSuggestion, setPersonSuggestion] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getScandals().then(setScandals).catch(console.error);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov'],
      'audio/*': ['.mp3', '.wav'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scandalId || !description.trim()) {
      setError('Selecciona un escándalo y escribe una descripción');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitTip({
        scandal_id: scandalId,
        description: description.trim(),
        person_name_suggestion: personSuggestion.trim() || undefined,
        files,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la pista');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-[#1a1a2e] rounded-2xl border border-green-800 p-10 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-400 mb-3">Pista Enviada</h2>
          <p className="text-gray-400 mb-6">
            Tu pista ha sido recibida y será revisada por nuestro equipo verificador.
            Tu identidad permanece completamente anónima.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setDescription('');
              setPersonSuggestion('');
              setFiles([]);
            }}
            className="bg-scandal-accent hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Enviar otra pista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Enviar Pista Anónima</h1>
        <p className="text-gray-400">
          Tu identidad permanece completamente anónima. No registramos IP, cookies ni datos personales.
          Sube documentos, fotos o cualquier evidencia relevante.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scandal selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Escándalo relacionado *
          </label>
          <select
            value={scandalId}
            onChange={(e) => setScandalId(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-scandal-accent transition-colors"
          >
            <option value="">Seleccionar escándalo...</option>
            {scandals.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Person suggestion */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Persona involucrada (opcional)
          </label>
          <input
            type="text"
            value={personSuggestion}
            onChange={(e) => setPersonSuggestion(e.target.value)}
            placeholder="Nombre de la persona que mencionas en la pista..."
            className="w-full bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-scandal-accent transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción de la pista *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe lo que sabes. Incluye fechas, nombres, lugares y cualquier detalle relevante..."
            className="w-full bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-scandal-accent transition-colors resize-y"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Archivos de evidencia (opcional)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-scandal-accent bg-scandal-accent/10'
                : 'border-[#2a2a4e] hover:border-[#4a4a6e]'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-3xl mb-2">📎</div>
            {isDragActive ? (
              <p className="text-scandal-accent">Suelta los archivos aquí...</p>
            ) : (
              <>
                <p className="text-gray-400">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-gray-600 text-xs mt-1">
                  Imágenes, PDFs, documentos, audio, video (máx. 50MB por archivo)
                </p>
              </>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">
                      {file.type.startsWith('image/') ? '🖼️' : '📄'}
                    </span>
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-gray-500 hover:text-scandal-accent ml-2 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-scandal-accent hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors"
        >
          {submitting ? 'Enviando...' : 'Enviar Pista Anónima'}
        </button>

        <p className="text-center text-gray-600 text-xs">
          Al enviar, aceptas que esta información será revisada por verificadores antes de ser publicada.
          No se almacena ningún dato que pueda identificarte.
        </p>
      </form>
    </div>
  );
}
