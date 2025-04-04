import { Edge, ReactFlowInstance } from '@xyflow/react';
import { createPathNode } from './Path';
import { getLayoutedElements } from '../../Layout';

let nodeIdCounter = 1;

export function addPathNode(parentId: string | null, rfInstance: ReactFlowInstance, direction: 'TB' | 'LR') {
  const nodes = rfInstance.getNodes();
  const edges = rfInstance.getEdges();
  
  // Generate unique ID for new node
  const newNodeId = `path-${nodeIdCounter++}`;
  
  // Create new node using createPathNode helper
  const newNode = createPathNode('new-endpoint', newNodeId, rfInstance, direction, false);

  // Create edge if there's a parent
  let newEdges: Edge[] = [...edges];
  if (parentId) {
    newEdges.push({
      id: `e-${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      type: 'smoothstep',
      animated: true
    });
  }

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    [...nodes, newNode],
    newEdges,
    direction
  );

  // Update flow
  rfInstance.setNodes(layoutedNodes);
  rfInstance.setEdges(layoutedEdges);
} 