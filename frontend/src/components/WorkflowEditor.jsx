import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Save, X } from 'lucide-react';

const initialNodes = [
  { id: '1', position: { x: 50, y: 50 }, data: { label: 'Working' }, type: 'input' },
  { id: '2', position: { x: 250, y: 50 }, data: { label: 'Review' } },
  { id: '3', position: { x: 450, y: 50 }, data: { label: 'Completed' }, type: 'output' },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export default function WorkflowEditor({ onSave, onClose, initialData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || initialEdges);
  const [nodeName, setNodeName] = useState('');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event, node) => {
    const newLabel = prompt('Enter new name for this point:', node.data.label);
    if (newLabel) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return { ...n, data: { ...n.data, label: newLabel } };
          }
          return n;
        })
      );
    }
  }, [setNodes]);

  const addNode = () => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      position: { x: 100, y: 150 },
      data: { label: nodeName || `New Point` },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeName('');
  };

  const handleSave = () => {
    onSave({ nodes, edges });
  };

  return (
    <div className="workflow-editor-container glass">
      <div className="editor-header">
        <div>
          <h2>🏗️ Workflow Builder</h2>
          <p className="hint">Click a node to rename it. Drag dots to connect.</p>
        </div>
        <button className="btn btn-close" onClick={onClose}><X size={20} /></button>
      </div>

      <div className="editor-controls">
        <input 
          type="text" 
          placeholder="New point name..." 
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addNode}>
          <Plus size={18} /> Add Point
        </button>
      </div>

      <div style={{ width: '100%', height: '450px', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      <div className="editor-footer">
        <p className="hint">Connect dots to define the order of work.</p>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} /> Save Workflow as Default
        </button>
      </div>

      <style>{`
        .workflow-editor-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 900px;
          height: 80vh;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          padding: 30px;
          background: white;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .editor-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .editor-controls input {
          flex: 1;
          margin-bottom: 0;
        }
        .editor-footer {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .hint {
          color: #64748b;
          font-size: 0.9rem;
        }
        .btn-close {
          background: #f1f5f9;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
