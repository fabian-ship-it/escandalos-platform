import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getScandalBoard } from '../api';
import ScandalNode from '../components/nodes/ScandalNode';
import PersonNode from '../components/nodes/PersonNode';
import EvidenceNode from '../components/nodes/EvidenceNode';

const nodeTypes = {
  scandalNode: ScandalNode,
  personNode: PersonNode,
  evidenceNode: EvidenceNode,
};

export default function ScandalBoard() {
  const { id } = useParams<{ id: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [scandal, setScandal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getScandalBoard(id)
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        setScandal(data.scandal);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-pulse text-gray-500 text-lg">Cargando tablero...</div>
      </div>
    );
  }

  if (!scandal) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <p className="text-gray-500">Escándalo no encontrado</p>
        <Link to="/" className="text-scandal-accent hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] relative">
      {/* Header overlay */}
      <div className="absolute top-4 left-4 z-10 bg-[#1a1a2e]/90 backdrop-blur-sm rounded-xl border border-[#2a2a4e] px-5 py-3 max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scandal.color }} />
          <h1 className="text-lg font-bold text-white">{scandal.name}</h1>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2">{scandal.description}</p>
      </div>

      {/* Tip button overlay */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          to={`/submit?scandal=${id}`}
          className="bg-scandal-accent hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline inline-block"
        >
          Enviar Pista sobre este caso
        </Link>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#1a1a2e]/90 backdrop-blur-sm rounded-xl border border-[#2a2a4e] px-4 py-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">Leyenda</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-scandal-accent" />
            <span className="text-xs text-gray-400">Escándalo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-400">Persona</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-scandal-gold" />
            <span className="text-xs text-gray-400">Evidencia</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {nodes.length <= 1 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-sm rounded-xl border border-[#2a2a4e] px-8 py-6 text-center">
            <p className="text-gray-400 mb-2">Este tablero aún no tiene conexiones</p>
            <p className="text-gray-600 text-sm">
              Las pistas aprobadas aparecerán aquí como nodos conectados
            </p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a4e" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'scandalNode') return '#e94560';
            if (node.type === 'personNode') return '#3b82f6';
            return '#f5a623';
          }}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}
