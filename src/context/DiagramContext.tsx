import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DiagramElement, Connection, CanvasState, HistoryState } from '../types';

interface DiagramContextType {
  // 元素管理
  elements: DiagramElement[];
  setElements: (elements: DiagramElement[]) => void;
  addElement: (element: DiagramElement) => void;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  removeElement: (id: string) => void;
  
  // 连接线管理
  connections: Connection[];
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  removeConnection: (id: string) => void;
  
  // 选择状态
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  selectedConnection: string | null;
  setSelectedConnection: (id: string | null) => void;
  
  // 画布状态
  canvasState: CanvasState;
  setCanvasState: (state: Partial<CanvasState>) => void;
  
  // 历史记录
  history: HistoryState[];
  historyIndex: number;
  saveToHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // 工具状态
  activeTool: string;
  setActiveTool: (tool: string) => void;
  
  // 图片状态
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  
  // 处理状态
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const useDiagramContext = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagramContext must be used within a DiagramProvider');
  }
  return context;
};

interface DiagramProviderProps {
  children: ReactNode;
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({ children }) => {
  // 基础状态
  const [elements, setElementsState] = useState<DiagramElement[]>([]);
  const [connections, setConnectionsState] = useState<Connection[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // 画布状态
  const [canvasState, setCanvasStateInternal] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    showGrid: true,
    showConnections: true
  });
  
  // 历史记录
  const [history, setHistory] = useState<HistoryState[]>([{
    elements: [],
    connections: [],
    timestamp: new Date(),
    description: '初始状态'
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // 元素管理函数
  const setElements = useCallback((newElements: DiagramElement[]) => {
    setElementsState(newElements);
  }, []);
  
  const addElement = useCallback((element: DiagramElement) => {
    setElementsState(prev => [...prev, element]);
  }, []);
  
  const updateElement = useCallback((id: string, updates: Partial<DiagramElement>) => {
    setElementsState(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);
  
  const removeElement = useCallback((id: string) => {
    setElementsState(prev => prev.filter(el => el.id !== id));
    // 同时删除相关连接线
    setConnectionsState(prev => prev.filter(conn => 
      conn.fromElementId !== id && conn.toElementId !== id
    ));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);
  
  // 连接线管理函数
  const setConnections = useCallback((newConnections: Connection[]) => {
    setConnectionsState(newConnections);
  }, []);
  
  const addConnection = useCallback((connection: Connection) => {
    setConnectionsState(prev => [...prev, connection]);
  }, []);
  
  const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    setConnectionsState(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    ));
  }, []);
  
  const removeConnection = useCallback((id: string) => {
    setConnectionsState(prev => prev.filter(conn => conn.id !== id));
    if (selectedConnection === id) {
      setSelectedConnection(null);
    }
  }, [selectedConnection]);
  
  // 画布状态管理
  const setCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasStateInternal(prev => ({ ...prev, ...updates }));
  }, []);
  
  // 历史记录管理
  const saveToHistory = useCallback((description: string) => {
    const newState: HistoryState = {
      elements: [...elements],
      connections: [...connections],
      timestamp: new Date(),
      description
    };
    
    // 删除当前索引之后的历史记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // 限制历史记录数量
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [elements, connections, history, historyIndex]);
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElementsState(prevState.elements);
      setConnectionsState(prevState.connections);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElementsState(nextState.elements);
      setConnectionsState(nextState.connections);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  const value: DiagramContextType = {
    // 元素管理
    elements,
    setElements,
    addElement,
    updateElement,
    removeElement,
    
    // 连接线管理
    connections,
    setConnections,
    addConnection,
    updateConnection,
    removeConnection,
    
    // 选择状态
    selectedElement,
    setSelectedElement,
    selectedConnection,
    setSelectedConnection,
    
    // 画布状态
    canvasState,
    setCanvasState,
    
    // 历史记录
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    
    // 工具状态
    activeTool,
    setActiveTool,
    
    // 图片状态
    uploadedImage,
    setUploadedImage,
    
    // 处理状态
    isProcessing,
    setIsProcessing
  };
  
  return (
    <DiagramContext.Provider value={value}>
      {children}
    </DiagramContext.Provider>
  );
};