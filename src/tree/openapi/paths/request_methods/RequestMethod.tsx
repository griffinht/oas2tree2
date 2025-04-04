import { ReactFlowInstance, Node, Edge } from '@xyflow/react';
import { deleteMethodNode } from './Delete';
import { editMethod } from './Edit';
import { createResponseNode } from './responses/response/ResponseCode';
import { getLayoutedElements } from '../../../Layout';
import { Trash2} from 'lucide-react';


export interface MethodNodeProps {
  method: string;
  nodeId: string;
  parentId?: string;
  rfInstance: ReactFlowInstance;
  direction: 'TB' | 'LR';
  summary?: string;
}

export function getMethodNodeStyle(method: string) {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return '#4CAF50';
      case 'POST': return '#FFC107';
      case 'PUT': return '#2196F3';
      case 'DELETE': return '#F44336';
      case 'PATCH': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return {
    background: getMethodColor(method),
    padding: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
  };
}

export function createMethodNode(
  method: string,
  nodeId: string,
  rfInstance: ReactFlowInstance,
  direction: 'TB' | 'LR',
  isHidden: boolean,
  parentId?: string,
  summary?: string
): { nodes: Node[], edges: Edge[] } {
  const methodNode = {
    id: nodeId,
    data: { 
      label: <MethodNode 
        method={method} 
        nodeId={nodeId}
        parentId={parentId}
        rfInstance={rfInstance} 
        direction={direction}
        summary={summary}
      />,
      parentId,
      summary
    },
    type: 'default',
    position: { x: 0, y: 0 },
    hidden: isHidden,
    style: getMethodNodeStyle(method)
  };

  return {
    nodes: [methodNode],
    edges: []
  };
}

export function MethodNode({ method, nodeId, rfInstance, direction, summary }: MethodNodeProps) {
  return (
    <div style={{
      alignItems: 'center',
      width: '25px',
      height: '20px',
      position: 'relative',
    }}
    onMouseEnter={e => {
      const menu = e.currentTarget.querySelector('.hover-menu') as HTMLElement;
      const tooltip = e.currentTarget.querySelector('.summary-tooltip') as HTMLElement;
      if (menu) menu.style.opacity = '1';
      if (tooltip) tooltip.style.opacity = '1';
    }}
    onMouseLeave={e => {
      const menu = e.currentTarget.querySelector('.hover-menu') as HTMLElement;
      const tooltip = e.currentTarget.querySelector('.summary-tooltip') as HTMLElement;
      if (menu) menu.style.opacity = '0';
      if (tooltip) tooltip.style.opacity = '0';
    }}
    >
      {summary && (
        <div 
          className="summary-tooltip"
          style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            marginBottom: '4px',
            zIndex: 1000,
          }}
        >
          {summary}
        </div>
      )}
      <select 
        defaultValue={method.toUpperCase()}
        onChange={(e) => editMethod(nodeId, e.target.value, rfInstance, direction)}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundColor: 'transparent',
          color: method.toUpperCase() === 'POST' ? 'black' : 'white',
          border: 'none'
        }}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>

      <div 
        className="hover-menu"
        style={{
          backgroundColor: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          display: 'flex',
          gap: '4px',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px',
          zIndex: 10,
        }}
      >
        <button 
          onClick={() => {
            const responseNodeId = `${nodeId}-response-${Date.now()}`;
            const { nodes, edges } = createResponseNode(
              '200',  // Default status code
              'OK',   // Default description
              responseNodeId,
              rfInstance,
              false
            );
            
            const allNodes = [...rfInstance.getNodes(), ...nodes];
            const allEdges = [
              ...rfInstance.getEdges(),
              ...edges,
              {
                id: `${nodeId}-to-${nodes[0].id}`,
                source: nodeId,
                target: nodes[0].id,
                type: 'smoothstep',
              }
            ];
            
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
              allNodes,
              allEdges,
              direction
            );
            rfInstance.setNodes(layoutedNodes);
            rfInstance.setEdges(layoutedEdges);
          }}
          style={{ fontSize: '0.9em' }}
        >
          Add response
        </button>
        <button 
            onClick={() => alert('expand')}
          >toggle expand/collapse</button>
        <button 
          onClick={() => deleteMethodNode(nodeId, rfInstance, direction)}
          id="delete-method-node"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
} 