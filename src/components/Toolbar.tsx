import React from 'react';
import { 
  MousePointer, 
  Hand, 
  Type, 
  Square, 
  Circle, 
  ArrowRight, 
  Link, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  RotateCw, 
  Grid, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut,
  Home
} from 'lucide-react';
import { useDiagramContext } from '../context/DiagramContext';
import { ToolbarAction } from '../types';

interface ToolbarProps {
  onImageUpload: (file: File) => void;
  onExport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onImageUpload, onExport }) => {
  const {
    activeTool,
    setActiveTool,
    canvasState,
    setCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
    elements,
    connections
  } = useDiagramContext();

  // 工具按钮配置
  const tools: Array<{
    id: ToolbarAction;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
  }> = [
    { id: 'select', icon: <MousePointer size={18} />, label: '选择', shortcut: 'V' },
    { id: 'pan', icon: <Hand size={18} />, label: '平移', shortcut: 'H' },
    { id: 'add-text', icon: <Type size={18} />, label: '文本', shortcut: 'T' },
    { id: 'add-box', icon: <Square size={18} />, label: '矩形', shortcut: 'R' },
    { id: 'add-circle', icon: <Circle size={18} />, label: '圆形', shortcut: 'O' },
    { id: 'add-arrow', icon: <ArrowRight size={18} />, label: '箭头', shortcut: 'A' },
    { id: 'connect', icon: <Link size={18} />, label: '连接', shortcut: 'C' },
    { id: 'delete', icon: <Trash2 size={18} />, label: '删除', shortcut: 'Del' }
  ];

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
    // 清空input值，允许重复上传同一文件
    e.target.value = '';
  };

  // 缩放控制
  const handleZoomIn = () => {
    const newScale = Math.min(3, canvasState.scale * 1.2);
    setCanvasState({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.1, canvasState.scale / 1.2);
    setCanvasState({ scale: newScale });
  };

  const handleZoomReset = () => {
    setCanvasState({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  // 切换网格显示
  const toggleGrid = () => {
    setCanvasState({ showGrid: !canvasState.showGrid });
  };

  // 切换连接线显示
  const toggleConnections = () => {
    setCanvasState({ showConnections: !canvasState.showConnections });
  };

  return (
    <div className="toolbar" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexWrap: 'wrap'
    }}>
      {/* 文件操作 */}
      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        
        <button
          className="btn btn-outline"
          onClick={onExport}
          disabled={elements.length === 0}
          title="导出图表"
        >
          <Download size={16} />
          导出
        </button>
      </div>

      {/* 分隔线 */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

      {/* 历史操作 */}
      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        <button
          className="btn btn-outline"
          onClick={undo}
          disabled={!canUndo}
          title="撤销 (Ctrl+Z)"
        >
          <RotateCcw size={16} />
        </button>
        
        <button
          className="btn btn-outline"
          onClick={redo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* 分隔线 */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

      {/* 工具选择 */}
      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTool(tool.id)}
            title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
            style={{
              minWidth: '40px',
              padding: '8px'
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

      {/* 视图控制 */}
      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        <button
          className="btn btn-outline"
          onClick={handleZoomOut}
          title="缩小"
        >
          <ZoomOut size={16} />
        </button>
        
        <button
          className="btn btn-outline"
          onClick={handleZoomReset}
          title="重置视图"
          style={{ minWidth: '60px' }}
        >
          <Home size={16} />
          {Math.round(canvasState.scale * 100)}%
        </button>
        
        <button
          className="btn btn-outline"
          onClick={handleZoomIn}
          title="放大"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* 分隔线 */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

      {/* 显示选项 */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          className={`btn ${canvasState.showGrid ? 'btn-primary' : 'btn-outline'}`}
          onClick={toggleGrid}
          title="显示/隐藏网格"
        >
          <Grid size={16} />
        </button>
        
        <button
          className={`btn ${canvasState.showConnections ? 'btn-primary' : 'btn-outline'}`}
          onClick={toggleConnections}
          title="显示/隐藏连接线"
        >
          {canvasState.showConnections ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {/* 状态信息 */}
      <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
        元素: {elements.length} | 连接: {connections.length}
      </div>
    </div>
  );
};

export default Toolbar;