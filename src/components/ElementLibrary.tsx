import React from 'react';
import { useDiagramContext } from '../context/DiagramContext';
import { DiagramElement } from '../types';
import { Square, Circle, Type, ArrowRight, Image, Star, Triangle, Hexagon } from 'lucide-react';

interface ElementLibraryProps {
  className?: string;
}

const ElementLibrary: React.FC<ElementLibraryProps> = ({ className = '' }) => {
  const { addElement, canvasState } = useDiagramContext();

  // 预定义的元素模板
  const elementTemplates = [
    {
      id: 'text',
      name: '文本',
      icon: Type,
      type: 'text' as const,
      defaultProps: {
        width: 120,
        height: 40,
        text: '文本内容',
        color: '#333333',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    {
      id: 'box',
      name: '矩形',
      icon: Square,
      type: 'box' as const,
      defaultProps: {
        width: 120,
        height: 80,
        text: '矩形',
        color: '#333333',
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 2,
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    {
      id: 'circle',
      name: '圆形',
      icon: Circle,
      type: 'circle' as const,
      defaultProps: {
        width: 100,
        height: 100,
        text: '圆形',
        color: '#333333',
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 2,
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    {
      id: 'arrow',
      name: '箭头',
      icon: ArrowRight,
      type: 'arrow' as const,
      defaultProps: {
        width: 80,
        height: 40,
        text: '',
        color: '#333333',
        backgroundColor: '#333333',
        borderColor: '#333333',
        borderWidth: 0,
        fontSize: 12,
        fontWeight: 'normal'
      }
    }
  ];

  // 预定义的样式模板
  const styleTemplates = [
    {
      id: 'primary',
      name: '主要样式',
      color: '#ffffff',
      backgroundColor: '#007bff',
      borderColor: '#0056b3'
    },
    {
      id: 'success',
      name: '成功样式',
      color: '#ffffff',
      backgroundColor: '#28a745',
      borderColor: '#1e7e34'
    },
    {
      id: 'warning',
      name: '警告样式',
      color: '#212529',
      backgroundColor: '#ffc107',
      borderColor: '#d39e00'
    },
    {
      id: 'danger',
      name: '危险样式',
      color: '#ffffff',
      backgroundColor: '#dc3545',
      borderColor: '#bd2130'
    },
    {
      id: 'info',
      name: '信息样式',
      color: '#ffffff',
      backgroundColor: '#17a2b8',
      borderColor: '#117a8b'
    },
    {
      id: 'light',
      name: '浅色样式',
      color: '#212529',
      backgroundColor: '#f8f9fa',
      borderColor: '#dee2e6'
    },
    {
      id: 'dark',
      name: '深色样式',
      color: '#ffffff',
      backgroundColor: '#343a40',
      borderColor: '#1d2124'
    }
  ];

  // 添加元素到画布
  const handleAddElement = (template: typeof elementTemplates[0]) => {
    // 计算画布中心位置
    const centerX = (canvasState.viewportWidth / 2 - canvasState.offset.x) / canvasState.scale;
    const centerY = (canvasState.viewportHeight / 2 - canvasState.offset.y) / canvasState.scale;

    const newElement: Omit<DiagramElement, 'id'> = {
      type: template.type,
      x: centerX - template.defaultProps.width / 2,
      y: centerY - template.defaultProps.height / 2,
      ...template.defaultProps,
      visible: true,
      rotation: 0
    };

    addElement(newElement);
  };

  // 渲染元素模板
  const renderElementTemplate = (template: typeof elementTemplates[0]) => {
    const IconComponent = template.icon;
    
    return (
      <div
        key={template.id}
        className="element-template"
        onClick={() => handleAddElement(template)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '80px',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#007bff';
          e.currentTarget.style.backgroundColor = '#f8f9ff';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <IconComponent size={24} style={{ color: '#666', marginBottom: '8px' }} />
        <span style={{ fontSize: '12px', color: '#333', fontWeight: '500' }}>
          {template.name}
        </span>
      </div>
    );
  };

  // 渲染样式模板
  const renderStyleTemplate = (style: typeof styleTemplates[0]) => {
    return (
      <div
        key={style.id}
        className="style-template"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '4px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#007bff';
          e.currentTarget.style.backgroundColor = '#f8f9ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e0e0e0';
          e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: style.backgroundColor,
            border: `2px solid ${style.borderColor}`,
            borderRadius: '4px',
            marginRight: '8px'
          }}
        />
        <span style={{ fontSize: '12px', color: '#333' }}>
          {style.name}
        </span>
      </div>
    );
  };

  return (
    <div className={`element-library ${className}`} style={{
      height: '100%',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#ffffff'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>元素库</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
          点击添加元素到画布
        </p>
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 基础元素 */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }}>
            基础元素
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {elementTemplates.map(renderElementTemplate)}
          </div>
        </div>

        {/* 快速样式 */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#333'
          }}>
            快速样式
          </h4>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            选择元素后点击应用样式
          </div>
          <div>
            {styleTemplates.map(renderStyleTemplate)}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-header" style={{ fontSize: '14px' }}>
            使用提示
          </div>
          <div className="card-body" style={{ fontSize: '12px', lineHeight: '1.5' }}>
            <ul style={{ margin: 0, paddingLeft: '16px' }}>
              <li>点击元素添加到画布中心</li>
              <li>拖拽元素可以移动位置</li>
              <li>拖拽元素四角可以调整大小</li>
              <li>双击元素可以编辑文本</li>
              <li>右键元素可以添加连接点</li>
              <li>选中元素后可在属性面板调整样式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementLibrary;