import {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  OnConnect,
  ReactFlowInstance,
  ConnectionLineType,
} from '@xyflow/react';

import { CustomEditor } from './editor/CustomEditor.tsx';
import { DragBar } from './dragbar/DragBar.tsx';

import '@xyflow/react/dist/style.css';

import { useState, useCallback, useEffect } from 'react';
import { initialNodes, nodeTypes } from './tree/nodes.ts';
import { edgeTypes, initialEdges } from './tree/index.ts';
import { ApiInfoBar } from './tree/Controls.tsx';
import { getPaths } from './Save';
import { setPaths } from './Load';

export default function App() {
  const [title, setTitle] = useState('My New API');
  const [version, setVersion] = useState('0.0.1');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [direction, setDirection] = useState<'TB' | 'LR'>(() => 
    (localStorage.getItem('direction') as 'TB' | 'LR') || 'TB'
  );
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const SAVE_DELAY = 1000; // 1 second in milliseconds
  const [splitPosition, setSplitPosition] = useState(50);
  const [autoSyncLeft, setAutoSyncLeft] = useState(() => 
    localStorage.getItem('autoSyncLeft') === 'true'
  );
  const [autoSyncRight, setAutoSyncRight] = useState(() => 
    localStorage.getItem('autoSyncRight') === 'true'
  );
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('direction', direction);
  }, [direction]);

  useEffect(() => {
    localStorage.setItem('autoSyncLeft', autoSyncLeft.toString());
  }, [autoSyncLeft]);

  useEffect(() => {
    localStorage.setItem('autoSyncRight', autoSyncRight.toString());
  }, [autoSyncRight]);

  useEffect(() => {
    if (!rfInstance) {
      console.log('useEffect not firing: rfInstance is not set');
      return;
    }
    const { nodes: layoutedNodes, edges: layoutedEdges } = setPaths(getPaths(rfInstance), direction, rfInstance);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [direction]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const getApi = () => {
    if (!rfInstance) {
      throw new Error('rfInstance is not set');
    }
    return {
      openapi: "3.0.0",
      info: { title, version },
      paths: getPaths(rfInstance)
    };
  };


  const setApi = (newApi: any) => {
    try {
      if (!rfInstance) {
        throw new Error('rfInstance is not set');
      }
      if (!newApi.openapi) {
        throw new Error('missing openapi version');
      }
      if (newApi.openapi !== '3.0.0') {
        throw new Error('unsupported openapi version ' + newApi.openapi + ', only 3.0.0 is supported');
      }
      if (!newApi.info) {
        throw new Error('missing info');
      }
      if (!newApi.info.title) {
        throw new Error('missing info.title');
      }
      setTitle(newApi.info.title);
      if (!newApi.info.version) {
        throw new Error('missing info.version');
      }
      setVersion(newApi.info.version);
      if (!newApi.paths) {
        throw new Error('missing paths');
      }
      const { nodes, edges } = setPaths(newApi.paths, direction, rfInstance);
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      console.error('Error setting API:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  };

  const saveToEditor = () => {
    const api = getApi();
    (window as any).editor?.setValue(JSON.stringify(api, null, 4));
    console.log('Saved API to editor');
  };

  const loadFromEditor = () => {
    const value = (window as any).editor?.getValue();
    if (!value) return;
    try {
      const parsedApi = JSON.parse(value);
      setApi(parsedApi);
      console.log('Loaded API from editor');
    } catch (error) {
      alert(error)
      console.error('Error parsing JSON:', error);
    }
  };

  // Auto-sync left (graph to editor)
  useEffect(() => {
    if (!autoSyncLeft || !rfInstance) return;
    
    const now = Date.now();
    if (now - lastSaveTime < SAVE_DELAY) return;
    
    saveToEditor();
    setLastSaveTime(now);
    console.log('autoload right to graph from editor')
  }, [nodes, edges, title, version]);

  // Auto-sync right (editor to graph) with debounce
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    if (!autoSyncRight) return;
    
    const now = Date.now();
    if (now - lastSaveTime < SAVE_DELAY) return;
    
    try {
      setApi(JSON.parse(value));
      setLastSaveTime(now);
      setSyncError(null);
    } catch (error) {
      setSyncError(error + "");
      console.error('Error parsing JSON:', error);
    }
  };

  return (
    <ReactFlowProvider>

        <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>        
        <div style={{ width: `${splitPosition}%`, height: '100%' }}>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#6BA539', zIndex: 9999 }}></div>
        <div style={{ height: '99%', paddingTop: '0.5rem', overflow: 'auto' }}>
        <CustomEditor 
            onMount={(editor) => {
              (window as any).editor = editor;
            }}
            onChange={handleEditorChange}
          />
        </div>         
        </div>
        <DragBar
          onLoadFromEditor={loadFromEditor}
          onSaveToEditor={saveToEditor}
          splitPosition={splitPosition}
          onSplitPositionChange={setSplitPosition}
          autoSyncLeft={autoSyncLeft}
          autoSyncRight={autoSyncRight}
          onAutoSyncLeftChange={setAutoSyncLeft}
          onAutoSyncRightChange={setAutoSyncRight}
          flowInstance={rfInstance}
          syncError={syncError}
        />
        <div style={{ width: `${100 - splitPosition}%`, height: '95%' }}>
          <ApiInfoBar 
            title={title} 
            setTitle={setTitle} 
            version={version} 
            setVersion={setVersion}
            direction={direction}
            setDirection={setDirection}
          />
          <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            edges={edges}
            edgeTypes={edgeTypes}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#6BA539', zIndex: 9999 }}></div>

      </div>
    </ReactFlowProvider>
  );
}
