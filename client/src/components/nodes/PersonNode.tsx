import { Handle, Position } from '@xyflow/react';

interface PersonNodeData {
  name: string;
  role_title: string;
  description: string;
  relationship: string;
  nodeType: string;
}

export default function PersonNode({ data }: { data: PersonNodeData }) {
  return (
    <div className="bg-[#1e1e3a] rounded-xl border-2 border-[#4a4a8e] shadow-xl px-6 py-4 min-w-[180px] max-w-[250px] cursor-grab hover:border-blue-400 transition-colors">
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-2.5 !h-2.5" />

      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {data.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">{data.name}</h4>
          {data.role_title && (
            <p className="text-[10px] text-gray-500">{data.role_title}</p>
          )}
        </div>
      </div>
      {data.description && (
        <p className="text-gray-400 text-[11px] leading-relaxed mt-1 line-clamp-2">
          {data.description}
        </p>
      )}
    </div>
  );
}
