import { Handle, Position } from '@xyflow/react';

interface EvidenceNodeData {
  title: string;
  description: string;
  evidence_type: string;
  file_path: string | null;
  original_file_name: string | null;
  nodeType: string;
}

const typeIcons: Record<string, string> = {
  document: '📄',
  image: '🖼️',
  link: '🔗',
  testimony: '💬',
};

const typeColors: Record<string, string> = {
  document: '#f5a623',
  image: '#10b981',
  link: '#3b82f6',
  testimony: '#a855f7',
};

export default function EvidenceNode({ data }: { data: EvidenceNodeData }) {
  const borderColor = typeColors[data.evidence_type] || '#f5a623';

  return (
    <div
      className="bg-[#1a1a30] rounded-lg border shadow-lg px-4 py-3 min-w-[150px] max-w-[200px] cursor-grab hover:brightness-110 transition-all"
      style={{ borderColor }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" style={{ background: borderColor }} />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{typeIcons[data.evidence_type] || '📎'}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: borderColor }}>
          {data.evidence_type}
        </span>
      </div>
      <p className="text-xs text-gray-300 font-medium leading-tight line-clamp-2">{data.title}</p>
      {data.file_path && (
        <a
          href={data.file_path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] mt-1 inline-block hover:underline"
          style={{ color: borderColor }}
          onClick={(e) => e.stopPropagation()}
        >
          Ver archivo →
        </a>
      )}
    </div>
  );
}
