import React, { useState, useRef, useEffect } from 'react';
import { DiagramElement as DiagramElementType, Connection } from '../types';
import { useDiagramContext } from '../context/DiagramContext';
import { v4 as uuidv4 } from 'uuid';

interface DiagramElementProps {
  element: DiagramElementType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DiagramElementType>) => void;
}

const DiagramElement: React.FC<DiagramElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate
}) => {
  const { 
    activeTool, 
    elements, 
    connections, 
    addConnection,
    setActiveTool,
    selectedElement,
    setSelectedElement
  } = useDiagramContext();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 选中元素
    onSelect(element.id);
    
    // 检查是否点击了调整大小的手柄
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || null);
      setDragStart({ x: e.clientX, y: e.clientY });
      setElementStart({ x: element.width, y: element.height });
      return;
    }
    
    // 开始拖拽
    if (activeTool === 'select') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setElementStart({ x: element.x, y: element.y });
    }
  };

  // 处理鼠标移动事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        onUpdate(element.id, {
          x: Math.max(0, elementStart.x + deltaX),
          y: Math.max(0, elementStart.y + deltaY)
        });
      } else if (isResizing && resizeHandle) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        let newWidth = elementStart.x;
        let newHeight = elementStart.y;
        
        switch (resizeHandle) {
          case 'se': // 右下角
            newWidth = Math.max(50, elementStart.x + deltaX);
            newHeight = Math.max(30, elementStart.y + deltaY);
            break;
          case 'sw': // 左下角
            newWidth = Math.max(50, elementStart.x - deltaX);
            newHeight = Math.max(30, elementStart.y + deltaY);
            break;
          case 'ne': // 右上角
            newWidth = Math.max(50, elementStart.x + deltaX);
            newHeight = Math.max(30, elementStart.y - deltaY);
            break;
          case 'nw': // 左上角
            newWidth = Math.max(50, elementStart.x - deltaX);
            newHeight = Math.max(30, elementStart.y - deltaY);
            break;
        }
        
        onUpdate(element.id, {
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, elementStart, element.id, onUpdate, resizeHandle]);

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 显示连接点
    setShowConnectionPoints(true);
    setActiveTool('connect');
    setSelectedElement(element.id);
    
    // 3秒后自动隐藏连接点
    setTimeout(() => {
      if (!isConnecting) {
        setShowConnectionPoints(false);
      }
    }, 3000);
  };

  // 处理双击编辑文本
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newText = prompt('编辑文本:', element.text || '');
    if (newText !== null) {
      onUpdate(element.id, { text: newText });
    }
  };

  // 处理鼠标进入元素
  const handleMouseEnter = () => {
    if (activeTool === 'connect' && selectedElement && selectedElement !== element.id) {
      setHoveredElement(element.id);
    }
  };

  // 处理鼠标离开元素
  const handleMouseLeave = () => {
    setHoveredElement(null);
  };

  // 处理连接点点击
  const handleConnectionPointClick = (e: React.MouseEvent, position: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activeTool === 'connect' && selectedElement && selectedElement !== element.id) {
      // 创建连接线
      const newConnection: Omit<Connection, 'id'> = {
        fromElementId: selectedElement,
        toElementId: element.id,
        lineType: 'straight',
        color: '#333333',
        width: 2,
        lineStyle: 'solid',
        arrowType: 'single',
        bold: false,
        visible: true
      };
      
      addConnection({ ...newConnection, id: uuidv4() });
      setActiveTool('select');
      setSelectedElement(null);
      setShowConnectionPoints(false);
      setIsConnecting(false);
    } else {
      // 开始连接模式
      setIsConnecting(true);
      setSelectedElement(element.id);
    }
  };

  // 根据元素类型渲染不同的形状
  const renderElementContent = () => {
    const style: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: element.fontSize || 14,
      fontWeight: element.fontWeight || 'normal',
      color: element.color || '#333333',
      backgroundColor: element.backgroundColor || '#ffffff',
      border: `${element.borderWidth || 1}px solid ${element.borderColor || '#cccccc'}`,
      borderRadius: element.type === 'circle' ? '50%' : '4px',
      overflow: 'hidden',
      wordBreak: 'break-word',
      textAlign: 'center',
      padding: '4px',
      boxSizing: 'border-box'
    };

    switch (element.type) {
      case 'box':
        return (
          <div style={style}>
            {element.text}
          </div>
        );
      
      case 'circle':
        return (
          <div style={style}>
            {element.text}
          </div>
        );
      
      case 'text':
        return (
          <div style={{
            ...style,
            backgroundColor: 'transparent',
            border: 'none'
          }}>
            {element.text}
          </div>
        );
      
      case 'arrow':
        return (
          <div style={{
            ...style,
            backgroundColor: element.backgroundColor || '#333333',
            clipPath: 'polygon(0% 40%, 60% 40%, 60% 20%, 100% 50%, 60% 80%, 60% 60%, 0% 60%)'
          }}>
          </div>
        );
      
      default:
        return (
          <div style={style}>
            {element.text}
          </div>
        );
    }
  };

  // 渲染调整大小的手柄
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      backgroundColor: '#007bff',
      border: '1px solid #ffffff',
      borderRadius: '2px',
      cursor: 'nw-resize'
    };

    return (
      <>
        {/* 四个角的调整手柄 */}
        <div
          className="resize-handle"
          data-handle="nw"
          style={{
            ...handleStyle,
            top: '-4px',
            left: '-4px',
            cursor: 'nw-resize'
          }}
        />
        <div
          className="resize-handle"
          data-handle="ne"
          style={{
            ...handleStyle,
            top: '-4px',
            right: '-4px',
            cursor: 'ne-resize'
          }}
        />
        <div
          className="resize-handle"
          data-handle="sw"
          style={{
            ...handleStyle,
            bottom: '-4px',
            left: '-4px',
            cursor: 'sw-resize'
          }}
        />
        <div
          className="resize-handle"
          data-handle="se"
          style={{
            ...handleStyle,
            bottom: '-4px',
            right: '-4px',
            cursor: 'se-resize'
          }}
        />
      </>
    );
  };

  // 渲染连接点
  const renderConnectionPoints = () => {
    if (!showConnectionPoints && !isSelected) return null;
    
    const pointStyle: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: '#28a745',
      border: '2px solid #ffffff',
      borderRadius: '50%',
      cursor: 'crosshair',
      zIndex: 1000
    };

    return (
      <>
        {/* 上方连接点 */}
        <div
          style={{
            ...pointStyle,
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          onClick={(e) => handleConnectionPointClick(e, 'top')}
          title="连接点"
        />
        {/* 右方连接点 */}
        <div
          style={{
            ...pointStyle,
            top: '50%',
            right: '-5px',
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => handleConnectionPointClick(e, 'right')}
          title="连接点"
        />
        {/* 下方连接点 */}
        <div
          style={{
            ...pointStyle,
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          onClick={(e) => handleConnectionPointClick(e, 'bottom')}
          title="连接点"
        />
        {/* 左方连接点 */}
        <div
          style={{
            ...pointStyle,
            top: '50%',
            left: '-5px',
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => handleConnectionPointClick(e, 'left')}
          title="连接点"
        />
      </>
    );
  };

  if (!element.visible) {
    return null;
  }

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.zIndex || 1,
        cursor: isDragging ? 'grabbing' : (activeTool === 'select' ? 'grab' : (activeTool === 'connect' ? 'crosshair' : 'default')),
        // 元素外框 - 始终显示
        border: isSelected ? '2px solid #007bff' : '1px solid #e0e0e0',
        borderRadius: '2px',
        // 悬停效果
        boxShadow: hoveredElement === element.id ? '0 0 10px rgba(40, 167, 69, 0.5)' : (isSelected ? '0 0 10px rgba(0, 123, 255, 0.3)' : 'none'),
        userSelect: 'none',
        transition: 'all 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`diagram-element ${isDragging ? 'dragging' : ''} ${hoveredElement === element.id ? 'hovered' : ''}`}
    >
      {renderElementContent()}
      {renderResizeHandles()}
      {renderConnectionPoints()}
    </div>
  );
};

export default DiagramElement;