import { ReactFlowInstance } from '@xyflow/react';
import { MethodNode } from './Method';

export function editMethod(nodeId: string, newMethod: string, rfInstance: ReactFlowInstance, direction: 'TB' | 'LR') {
  rfInstance.setNodes(nodes => nodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          label: <MethodNode method={newMethod} nodeId={nodeId} rfInstance={rfInstance} direction={direction} />
        }
      };
    }
    return node;
  }));
}