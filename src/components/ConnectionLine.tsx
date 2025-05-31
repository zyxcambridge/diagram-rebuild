import React from 'react';
import { Connection, DiagramElement } from '../types';

interface ConnectionLineProps {
  connection: Connection;
  fromElement: DiagramElement;
  toElement: DiagramElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  fromElement,
  toElement,
  isSelected,
  onSelect
}) => {
  if (!connection.visible) {
    return null;
  }

  // 计算连接点
  const getConnectionPoint = (element: DiagramElement, isFrom: boolean, otherElement: DiagramElement) => {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const otherCenterX = otherElement.x + otherElement.width / 2;
    const otherCenterY = otherElement.y + otherElement.height / 2;
    
    // 计算方向
    const dx = otherCenterX - centerX;
    const dy = otherCenterY - centerY;
    
    // 根据方向计算边缘连接点
    let x = centerX;
    let y = centerY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平方向
      x = dx > 0 ? element.x + element.width : element.x;
      y = centerY;
    } else {
      // 垂直方向
      x = centerX;
      y = dy > 0 ? element.y + element.height : element.y;
    }
    
    return { x, y };
  };

  const fromPoint = getConnectionPoint(fromElement, true, toElement);
  const toPoint = getConnectionPoint(toElement, false, fromElement);

  // 生成箭头标记
  const generateArrowMarker = () => {
    const { arrowType = 'single' } = connection;
    const markerId = `arrow-${connection.id}`;
    const color = connection.color || '#666';
    
    return (
      <defs>
        {/* 结束箭头 */}
        {(arrowType === 'single' || arrowType === 'double') && (
          <marker
            id={markerId}
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M2,2 L2,10 L10,6 z"
              fill={color}
              stroke={color}
            />
          </marker>
        )}
        
        {/* 开始箭头（双向箭头时使用） */}
        {arrowType === 'double' && (
          <marker
            id={`${markerId}-start`}
            markerWidth="12"
            markerHeight="12"
            refX="2"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M10,2 L10,10 L2,6 z"
              fill={color}
              stroke={color}
            />
          </marker>
        )}
        
        {/* 圆形标记 */}
        {arrowType === 'circle' && (
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <circle
              cx="5"
              cy="5"
              r="3"
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
          </marker>
        )}
        
        {/* 菱形标记 */}
        {arrowType === 'diamond' && (
          <marker
            id={markerId}
            markerWidth="12"
            markerHeight="12"
            refX="6"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M2,6 L6,2 L10,6 L6,10 z"
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
          </marker>
        )}
      </defs>
    );
  };

  // 生成路径
  const generatePath = () => {
    const { lineType = 'straight' } = connection;
    
    switch (lineType) {
      case 'curved':
        // 贝塞尔曲线
        const dx = toPoint.x - fromPoint.x;
        const dy = toPoint.y - fromPoint.y;
        const controlOffset = Math.max(50, Math.abs(dx) * 0.3, Math.abs(dy) * 0.3);
        
        let controlX1, controlY1, controlX2, controlY2;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平方向为主
          controlX1 = fromPoint.x + (dx > 0 ? controlOffset : -controlOffset);
          controlY1 = fromPoint.y;
          controlX2 = toPoint.x - (dx > 0 ? controlOffset : -controlOffset);
          controlY2 = toPoint.y;
        } else {
          // 垂直方向为主
          controlX1 = fromPoint.x;
          controlY1 = fromPoint.y + (dy > 0 ? controlOffset : -controlOffset);
          controlX2 = toPoint.x;
          controlY2 = toPoint.y - (dy > 0 ? controlOffset : -controlOffset);
        }
        
        return `M ${fromPoint.x} ${fromPoint.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toPoint.x} ${toPoint.y}`;
      
      case 'polyline':
        // 智能折线
        const midX = fromPoint.x + (toPoint.x - fromPoint.x) * 0.5;
        const midY = fromPoint.y + (toPoint.y - fromPoint.y) * 0.5;
        
        // 根据起点和终点的相对位置选择折线路径
        if (Math.abs(toPoint.x - fromPoint.x) > Math.abs(toPoint.y - fromPoint.y)) {
          // 水平优先
          return `M ${fromPoint.x} ${fromPoint.y} L ${midX} ${fromPoint.y} L ${midX} ${toPoint.y} L ${toPoint.x} ${toPoint.y}`;
        } else {
          // 垂直优先
          return `M ${fromPoint.x} ${fromPoint.y} L ${fromPoint.x} ${midY} L ${toPoint.x} ${midY} L ${toPoint.x} ${toPoint.y}`;
        }
      
      case 'orthogonal':
        // 正交折线（直角）
        if (Math.abs(toPoint.x - fromPoint.x) > Math.abs(toPoint.y - fromPoint.y)) {
          return `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`;
        } else {
          return `M ${fromPoint.x} ${fromPoint.y} L ${fromPoint.x} ${toPoint.y} L ${toPoint.x} ${toPoint.y}`;
        }
      
      default:
        // 直线
        return `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`;
    }
  };

  // 获取线条样式
  const getStrokeStyle = () => {
    const { lineStyle = 'solid', width = 2, bold = false } = connection;
    
    let strokeDasharray = 'none';
    switch (lineStyle) {
      case 'dashed':
        strokeDasharray = '10,5';
        break;
      case 'dotted':
        strokeDasharray = '3,3';
        break;
      case 'dashdot':
        strokeDasharray = '10,5,3,5';
        break;
    }
    
    const strokeWidth = bold ? Math.max(width * 1.5, 3) : width;
    
    return {
      stroke: connection.color || '#666',
      strokeWidth,
      strokeDasharray,
      fill: 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    };
  };

  const path = generatePath();
  const strokeStyle = getStrokeStyle();
  const { arrowType = 'single' } = connection;
  const markerId = `arrow-${connection.id}`;

  return (
    <g className={`connection-line ${isSelected ? 'selected' : ''}`}>
      {generateArrowMarker()}
      
      {/* 选中时的高亮背景 */}
      {isSelected && (
        <path
          d={path}
          stroke="#007bff"
          strokeWidth={strokeStyle.strokeWidth + 4}
          strokeDasharray="none"
          fill="none"
          opacity="0.3"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* 主路径 */}
      <path
        d={path}
        {...strokeStyle}
        markerEnd={arrowType !== 'none' ? `url(#${markerId})` : undefined}
        markerStart={arrowType === 'double' ? `url(#${markerId}-start)` : undefined}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(0, 123, 255, 0.5))' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connection.id);
        }}
      />
      
      {/* 透明的宽路径，用于更容易的点击 */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connection.id);
        }}
      />
      
      {/* 连接点标记 */}
      <circle
        cx={fromPoint.x}
        cy={fromPoint.y}
        r="3"
        fill={connection.color || '#666'}
        opacity={isSelected ? 0.8 : 0.4}
        style={{ pointerEvents: 'none' }}
      />
      <circle
        cx={toPoint.x}
        cy={toPoint.y}
        r="3"
        fill={connection.color || '#666'}
        opacity={isSelected ? 0.8 : 0.4}
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
};

export default ConnectionLine;