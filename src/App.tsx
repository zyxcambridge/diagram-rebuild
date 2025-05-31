import React, { useState } from 'react';
import { DiagramProvider } from './context/DiagramContext';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import ChatPanel from './components/ChatPanel';
import ImagePanel from './components/ImagePanel';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

const App: React.FC = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false);

  return (
    <DiagramProvider>
      <div className="app" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* 顶部工具栏 */}
        <div style={{
          height: '60px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {/* 左侧标题 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#007bff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              图
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#333'
            }}>
              以图画图系统
            </h1>
          </div>

          {/* 中间工具栏 */}
          <div style={{ flex: 1, margin: '0 20px' }}>
            <Toolbar 
              onExport={() => {
                // 处理导出
                console.log('Export diagram');
              }}
            />
          </div>

          {/* 右侧面板控制 */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              className="btn btn-outline"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              style={{ padding: '8px' }}
              title={leftPanelCollapsed ? '展开原图' : '收起原图'}
            >
              {leftPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            
            <button
              className="btn btn-outline"
              onClick={() => setChatPanelCollapsed(!chatPanelCollapsed)}
              style={{ padding: '8px' }}
              title={chatPanelCollapsed ? '展开AI助手' : '收起AI助手'}
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}>
          {/* 左侧原图显示 */}
          {!leftPanelCollapsed && (
            <div style={{
              width: '400px',
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ImagePanel />
            </div>
          )}

          {/* 中间画布区域 */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}>
            {/* 画布 */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Canvas />
            </div>
          </div>

          {/* 右侧AI助手面板 */}
          {!chatPanelCollapsed && (
            <div style={{
              width: '400px',
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* AI助手面板头部 */}
              <div style={{
                height: '40px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  AI 助手
                </h4>
                <button
                  className="btn btn-ghost"
                  onClick={() => setChatPanelCollapsed(true)}
                  style={{ padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* AI助手内容 */}
              <div style={{ flex: 1 }}>
                <ChatPanel />
              </div>
            </div>
          )}
        </div>

        {/* 状态栏 */}
        <div style={{
          height: '24px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div>
            就绪
          </div>
          <div>
            以图画图系统 v1.0.0
          </div>
        </div>
      </div>
    </DiagramProvider>
  );
};

export default App;