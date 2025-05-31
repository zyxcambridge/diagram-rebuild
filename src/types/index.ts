// 图表元素类型
export type DiagramElementType = 'text' | 'box' | 'circle' | 'arrow' | 'line' | 'image';

// 连接线类型
export type ConnectionType = 'straight' | 'curved' | 'polyline' | 'orthogonal';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dashdot';
export type ArrowType = 'none' | 'single' | 'double' | 'circle' | 'diamond';

// 图表元素接口
export interface DiagramElement {
  id: string;
  type: DiagramElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  fontWeight?: string;
  visible?: boolean;
  rotation?: number;
  zIndex?: number;
}

// 连接点接口
export interface ConnectionPoint {
  id: string;
  elementId: string;
  x: number;
  y: number;
  position: 'top' | 'right' | 'bottom' | 'left';
}

// 连接线接口
export interface Connection {
  id: string;
  fromElementId: string;
  toElementId: string;
  fromPoint?: ConnectionPoint;
  toPoint?: ConnectionPoint;
  lineType?: ConnectionType;
  lineStyle?: LineStyle;
  arrowType?: ArrowType;
  color?: string;
  width?: number;
  bold?: boolean;
  visible?: boolean;
}

// AI响应接口
export interface AIResponse {
  elements: DiagramElement[];
  connections?: Connection[];
  description?: string;
}

// 画布状态接口
export interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  showGrid: boolean;
  showConnections: boolean;
}

// 工具栏操作类型
export type ToolbarAction = 
  | 'select'
  | 'pan'
  | 'add-text'
  | 'add-box'
  | 'add-circle'
  | 'add-arrow'
  | 'connect'
  | 'delete';

// 聊天消息接口
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

// 项目配置接口
export interface ProjectConfig {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

// 导出选项接口
export interface ExportOptions {
  format: 'svg' | 'png' | 'jpg' | 'pdf';
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeConnections?: boolean;
}

// 历史记录接口
export interface HistoryState {
  elements: DiagramElement[];
  connections: Connection[];
  timestamp: Date;
  description: string;
}