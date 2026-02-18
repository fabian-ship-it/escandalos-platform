import { Handle, Position } from '@xyflow/react';

interface ScandalNodeData {
  name: string;
  description: string;
  color: string;
  nodeType: string;
}

export default function ScandalNode({ data }: { data: ScandalNodeData }) {
  return (
    <div
      className="rounded-2xl shadow-2xl border-2 px-8 py-5 min-w-[220px] max-w-[320px] cursor-grab"
      style={{
        backgroundColor: '#1a1a2e',
        borderColor: data.color || '#e94560',
        boxShadow: `0 0 30px ${data.color || '#e94560'}33`,
      }}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-scandal-accent !w-3 !h-3" />
      <Handle type="target" position={Position.Top} className="!bg-scandal-accent !w-3 !h-3" />

      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: data.color || '#e94560' }}
        />
        <h3 className="text-lg font-black text-white leading-tight">{data.name}</h3>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{data.description}</p>
    </div>
  );
}
