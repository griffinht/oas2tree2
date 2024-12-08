import { addMethodNode } from '../method/Add';
import { addPathNode } from './Add';
import { editPathSegment } from './Edit';
import { deletePathNode } from './Delete';
import { collapsePathNode } from './Collapse';
import { ReactFlowInstance } from '@xyflow/react';

export interface PathNodeProps {
  segment: string;
  nodeId: string;
  rfInstance: ReactFlowInstance;
  direction: 'TB' | 'LR';
} 

export function PathNode({ segment, nodeId, rfInstance, direction }: PathNodeProps) {
  return (
    <div>
      <input 
        type="text"
        defaultValue={segment}
        onChange={(e) => editPathSegment(nodeId, e.target.value, rfInstance, direction)}
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: 'inherit', width: '100px' }}
      />
      <div>
        <button onClick={() => addMethodNode(nodeId, rfInstance, direction)}>+ GET</button>
        <button onClick={() => addPathNode(nodeId, rfInstance, direction)}>+ endpoint</button>
        <button onClick={() => deletePathNode(nodeId, rfInstance, direction)}>X</button>
        <button onClick={() => collapsePathNode(nodeId, rfInstance, direction)}>-</button>
      </div>
    </div>
  );
} 