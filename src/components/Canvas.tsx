import React, { useRef, useState, useEffect } from 'react';
import { useDiagramContext } from '../context/DiagramContext';
import DiagramElement from './DiagramElement';
import ConnectionLine from './ConnectionLine';

interface CanvasProps {
  className?: string;
}

const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const {
    elements,
    connections,
    selectedElement,
    selectedConnection,
    setSelectedElement,
    setSelectedConnection,
    updateElement,
    canvasState,
    setCanvasState,
    uploadedImage,
    isProcessing
  } = useDiagramContext();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });

  // 处理画布点击（取消选择）
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setSelectedConnection(null);
    }
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, canvasState.scale * delta));
    
    setCanvasState({ scale: newScale });
  };

  // 处理平移
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // 中键或Ctrl+左键
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setOffsetStart({ x: canvasState.offsetX, y: canvasState.offsetY });
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        
        setCanvasState({
          offsetX: offsetStart.x + deltaX,
          offsetY: offsetStart.y + deltaY
        });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart, offsetStart, setCanvasState]);

  // 渲染网格
  const renderGrid = () => {
    if (!canvasState.showGrid) return null;
    
    const gridSize = 20 * canvasState.scale;
    const offsetX = canvasState.offsetX % gridSize;
    const offsetY = canvasState.offsetY % gridSize;
    
    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <defs>
          <pattern
            id="grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
            x={offsetX}
            y={offsetY}
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    );
  };

  // 渲染处理中的状态
  const renderProcessingOverlay = () => {
    if (!isProcessing) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
            AI正在分析图片...
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            请稍候，这可能需要几秒钟
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        cursor: isPanning ? 'grabbing' : 'default'
      }}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      {/* 网格 */}
      {renderGrid()}
      
      {/* 元素容器 */}
      <div
        style={{
          position: 'absolute',
          top: canvasState.offsetY,
          left: canvasState.offsetX,
          transform: `scale(${canvasState.scale})`,
          transformOrigin: 'top left',
          width: '100%',
          height: '100%',
          zIndex: 2
        }}
      >
        {/* 渲染图表元素 */}
        {elements.map(element => (
          <DiagramElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={setSelectedElement}
            onUpdate={updateElement}
          />
        ))}
      </div>
      
      {/* 连接线容器 */}
      {canvasState.showConnections && (
        <svg
          style={{
            position: 'absolute',
            top: canvasState.offsetY,
            left: canvasState.offsetX,
            transform: `scale(${canvasState.scale})`,
            transformOrigin: 'top left',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {connections.map(connection => {
            const fromElement = elements.find(el => el.id === connection.fromElementId);
            const toElement = elements.find(el => el.id === connection.toElementId);
            
            if (!fromElement || !toElement) return null;
            
            return (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                fromElement={fromElement}
                toElement={toElement}
                isSelected={selectedConnection === connection.id}
                onSelect={setSelectedConnection}
              />
            );
          })}
        </svg>
      )}
      
      {/* 处理中的覆盖层 */}
      {renderProcessingOverlay()}
      
      {/* 画布信息显示 */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 100
        }}
      >
        缩放: {Math.round(canvasState.scale * 100)}% | 元素: {elements.length} | 连接: {connections.length}
      </div>
    </div>
  );
};

export default Canvas;