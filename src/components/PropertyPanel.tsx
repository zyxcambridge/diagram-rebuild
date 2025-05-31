import React, { useState, useEffect } from 'react';
import { useDiagramContext } from '../context/DiagramContext';
import { Palette, Type, Move, Eye, EyeOff, Trash2 } from 'lucide-react';

interface PropertyPanelProps {
  className?: string;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ className = '' }) => {
  const {
    elements,
    connections,
    selectedElement,
    selectedConnection,
    updateElement,
    updateConnection,
    removeElement,
    removeConnection
  } = useDiagramContext();

  const [localValues, setLocalValues] = useState<any>({});

  // 获取当前选中的元素或连接
  const currentElement = selectedElement ? elements.find(el => el.id === selectedElement) : null;
  const currentConnection = selectedConnection ? connections.find(conn => conn.id === selectedConnection) : null;

  // 同步本地值
  useEffect(() => {
    if (currentElement) {
      setLocalValues({
        text: currentElement.text || '',
        x: currentElement.x,
        y: currentElement.y,
        width: currentElement.width,
        height: currentElement.height,
        color: currentElement.color || '#333333',
        backgroundColor: currentElement.backgroundColor || '#ffffff',
        borderColor: currentElement.borderColor || '#cccccc',
        borderWidth: currentElement.borderWidth || 1,
        fontSize: currentElement.fontSize || 14,
        fontWeight: currentElement.fontWeight || 'normal',
        rotation: currentElement.rotation || 0
      });
    } else if (currentConnection) {
      setLocalValues({
        color: currentConnection.color || '#333333',
        width: currentConnection.width || 2,
        lineType: currentConnection.lineType || 'straight',
        lineStyle: currentConnection.lineStyle || 'solid',
        arrowType: currentConnection.arrowType || 'arrow'
      });
    }
  }, [currentElement, currentConnection]);

  // 更新元素属性
  const handleElementUpdate = (property: string, value: any) => {
    if (!currentElement) return;
    
    setLocalValues((prev: any) => ({ ...prev, [property]: value }));
    updateElement(currentElement.id, { [property]: value });
  };

  // 更新连接属性
  const handleConnectionUpdate = (property: string, value: any) => {
    if (!currentConnection) return;
    
    setLocalValues((prev: any) => ({ ...prev, [property]: value }));
    updateConnection(currentConnection.id, { [property]: value });
  };

  // 删除当前选中项
  const handleDelete = () => {
    if (currentElement) {
      removeElement(currentElement.id);
    } else if (currentConnection) {
      removeConnection(currentConnection.id);
    }
  };

  // 切换可见性
  const handleToggleVisibility = () => {
    if (currentElement) {
      handleElementUpdate('visible', !currentElement.visible);
    } else if (currentConnection) {
      handleConnectionUpdate('visible', !currentConnection.visible);
    }
  };

  // 渲染元素属性面板
  const renderElementProperties = () => {
    if (!currentElement) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 基本信息 */}
        <div className="card">
          <div className="card-header">
            <Type size={16} />
            基本属性
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 文本内容 */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>文本内容</label>
              <textarea
                value={localValues.text || ''}
                onChange={(e) => handleElementUpdate('text', e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  resize: 'vertical'
                }}
                placeholder="输入文本内容..."
              />
            </div>
            
            {/* 元素类型 */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>元素类型</label>
              <select
                value={currentElement.type}
                onChange={(e) => handleElementUpdate('type', e.target.value)}
                className="input"
                style={{ width: '100%', fontSize: '12px' }}
              >
                <option value="text">文本</option>
                <option value="box">矩形</option>
                <option value="circle">圆形</option>
                <option value="arrow">箭头</option>
              </select>
            </div>
          </div>
        </div>

        {/* 位置和大小 */}
        <div className="card">
          <div className="card-header">
            <Move size={16} />
            位置和大小
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 位置 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>X 坐标</label>
                <input
                  type="number"
                  value={localValues.x || 0}
                  onChange={(e) => handleElementUpdate('x', parseInt(e.target.value) || 0)}
                  className="input"
                  style={{ fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Y 坐标</label>
                <input
                  type="number"
                  value={localValues.y || 0}
                  onChange={(e) => handleElementUpdate('y', parseInt(e.target.value) || 0)}
                  className="input"
                  style={{ fontSize: '12px' }}
                />
              </div>
            </div>
            
            {/* 大小 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>宽度</label>
                <input
                  type="number"
                  value={localValues.width || 0}
                  onChange={(e) => handleElementUpdate('width', Math.max(50, parseInt(e.target.value) || 50))}
                  className="input"
                  style={{ fontSize: '12px' }}
                  min="50"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>高度</label>
                <input
                  type="number"
                  value={localValues.height || 0}
                  onChange={(e) => handleElementUpdate('height', Math.max(30, parseInt(e.target.value) || 30))}
                  className="input"
                  style={{ fontSize: '12px' }}
                  min="30"
                />
              </div>
            </div>
            
            {/* 旋转 */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>旋转角度</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={localValues.rotation || 0}
                onChange={(e) => handleElementUpdate('rotation', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                {localValues.rotation || 0}°
              </div>
            </div>
          </div>
        </div>

        {/* 样式 */}
        <div className="card">
          <div className="card-header">
            <Palette size={16} />
            样式设置
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 文字样式 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>字体大小</label>
                <input
                  type="number"
                  value={localValues.fontSize || 14}
                  onChange={(e) => handleElementUpdate('fontSize', Math.max(8, parseInt(e.target.value) || 14))}
                  className="input"
                  style={{ fontSize: '12px' }}
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>字体粗细</label>
                <select
                  value={localValues.fontWeight || 'normal'}
                  onChange={(e) => handleElementUpdate('fontWeight', e.target.value)}
                  className="input"
                  style={{ fontSize: '12px' }}
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                  <option value="lighter">细体</option>
                </select>
              </div>
            </div>
            
            {/* 颜色 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>文字颜色</label>
                <input
                  type="color"
                  value={localValues.color || '#333333'}
                  onChange={(e) => handleElementUpdate('color', e.target.value)}
                  style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>背景颜色</label>
                <input
                  type="color"
                  value={localValues.backgroundColor || '#ffffff'}
                  onChange={(e) => handleElementUpdate('backgroundColor', e.target.value)}
                  style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                />
              </div>
            </div>
            
            {/* 边框 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>边框颜色</label>
                <input
                  type="color"
                  value={localValues.borderColor || '#cccccc'}
                  onChange={(e) => handleElementUpdate('borderColor', e.target.value)}
                  style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>边框宽度</label>
                <input
                  type="number"
                  value={localValues.borderWidth || 1}
                  onChange={(e) => handleElementUpdate('borderWidth', Math.max(0, parseInt(e.target.value) || 1))}
                  className="input"
                  style={{ fontSize: '12px' }}
                  min="0"
                  max="10"
                />
              </div>
            </div>
            
            {/* 加粗选项 */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={localValues.bold || false}
                  onChange={(e) => handleConnectionUpdate('bold', e.target.checked)}
                />
                加粗线条
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染连接线属性面板
  const renderConnectionProperties = () => {
    if (!currentConnection) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card">
          <div className="card-header">
            连接线属性
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 线条类型 */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>线条类型</label>
              <select
                value={localValues.lineType || 'straight'}
                onChange={(e) => handleConnectionUpdate('lineType', e.target.value)}
                className="input"
                style={{ fontSize: '12px' }}
              >
                <option value="straight">直线</option>
                <option value="curved">曲线</option>
                <option value="polyline">智能折线</option>
                <option value="orthogonal">正交折线</option>
              </select>
            </div>
            
            {/* 线条样式 */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>线条样式</label>
              <select
                value={localValues.lineStyle || 'solid'}
                onChange={(e) => handleConnectionUpdate('lineStyle', e.target.value)}
                className="input"
                style={{ fontSize: '12px' }}
              >
                <option value="solid">实线</option>
                <option value="dashed">虚线</option>
                <option value="dotted">点线</option>
                <option value="dashdot">点划线</option>
              </select>
            </div>
            
            {/* 箭头类型 */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>箭头类型</label>
              <select
                value={localValues.arrowType || 'arrow'}
                onChange={(e) => handleConnectionUpdate('arrowType', e.target.value)}
                className="input"
                style={{ fontSize: '12px' }}
              >
                <option value="none">无箭头</option>
                <option value="single">单向箭头</option>
                <option value="double">双向箭头</option>
                <option value="circle">圆形</option>
                <option value="diamond">菱形</option>
              </select>
            </div>
            
            {/* 颜色和宽度 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>颜色</label>
                <input
                  type="color"
                  value={localValues.color || '#333333'}
                  onChange={(e) => handleConnectionUpdate('color', e.target.value)}
                  style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>线条宽度</label>
                <input
                  type="number"
                  value={localValues.width || 2}
                  onChange={(e) => handleConnectionUpdate('width', Math.max(1, parseInt(e.target.value) || 2))}
                  className="input"
                  style={{ fontSize: '12px' }}
                  min="1"
                  max="8"
                />
              </div>
            </div>
            
            {/* 加粗选项 */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '500', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={localValues.bold || false}
                  onChange={(e) => handleConnectionUpdate('bold', e.target.checked)}
                />
                加粗线条
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`property-panel ${className}`} style={{
      height: '100%',
      backgroundColor: '#f8f9fa',
      borderLeft: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#ffffff'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>属性面板</h3>
        {(currentElement || currentConnection) && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px'
          }}>
            <button
              className="btn btn-outline"
              onClick={handleToggleVisibility}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              {(currentElement?.visible !== false && currentConnection?.visible !== false) ? 
                <><Eye size={12} /> 隐藏</> : 
                <><EyeOff size={12} /> 显示</>
              }
            </button>
            
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              <Trash2 size={12} />
              删除
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {currentElement && renderElementProperties()}
        {currentConnection && renderConnectionProperties()}
        
        {!currentElement && !currentConnection && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginTop: '40px'
          }}>
            <div style={{ marginBottom: '8px' }}>请选择一个元素或连接线</div>
            <div style={{ fontSize: '12px' }}>点击画布中的元素来编辑其属性</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;