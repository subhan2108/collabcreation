import React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowVisualizer({ workflowData, currentStepId }) {
  const nodes = workflowData?.nodes || [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Working' }, type: 'input' },
    { id: '2', position: { x: 200, y: 0 }, data: { label: 'Review' } },
    { id: '3', position: { x: 400, y: 0 }, data: { label: 'Completed' }, type: 'output' },
  ];

  const edges = workflowData?.edges || [
    { id: 'e1-2', source: '1', target: '2', animated: currentStepId === '1' },
    { id: 'e2-3', source: '2', target: '3', animated: currentStepId === '2' },
  ];

  // Map status to colors
  const styledNodes = nodes.map(node => {
    let color = '#f1f5f9';
    let textColor = '#64748b';
    let borderColor = '#e2e8f0';

    if (node.id === currentStepId) {
      color = '#eff6ff';
      textColor = '#2563eb';
      borderColor = '#3b82f6';
    } else if (parseInt(node.id) < parseInt(currentStepId)) {
      color = '#f0fdf4';
      textColor = '#16a34a';
      borderColor = '#22c55e';
    }

    return {
      ...node,
      style: { 
        background: color, 
        color: textColor, 
        borderColor: borderColor,
        borderRadius: '12px',
        fontWeight: 'bold',
        padding: '10px'
      }
    };
  });

  return (
    <div style={{ width: '100%', height: '150px', background: 'transparent' }}>
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
      >
        <Background color="#ccc" gap={20} />
      </ReactFlow>
    </div>
  );
}
