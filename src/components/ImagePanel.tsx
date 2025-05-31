import React, { useState } from 'react';
import { useDiagramContext } from '../context/DiagramContext';
import { Image, Upload, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ImagePanel: React.FC = () => {
  const { uploadedImage } = useDiagramContext();
  const [imageScale, setImageScale] = useState(1);

  // 缩放控制函数
  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetZoom = () => {
    setImageScale(1);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px'
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#333',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '8px'
      }}>
        原图预览
      </div>
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {uploadedImage ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 缩放控制按钮 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              padding: '0 16px'
            }}>
              <button
                onClick={handleZoomOut}
                style={{
                  padding: '6px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="缩小"
              >
                <ZoomOut size={16} />
              </button>
              
              <button
                onClick={handleResetZoom}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  minWidth: '50px'
                }}
                title="重置缩放"
              >
                {Math.round(imageScale * 100)}%
              </button>
              
              <button
                onClick={handleZoomIn}
                style={{
                  padding: '6px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="放大"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            
            {/* 图片显示区域 */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px 16px'
            }}>
              <img
                src={uploadedImage}
                alt="上传的原图"
                style={{
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>
            
            <div style={{
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              padding: '8px 16px',
              borderTop: '1px solid #f0f0f0'
            }}>
              原始上传图片
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#999',
            padding: '32px 16px'
          }}>
            <Image size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              暂无上传图片
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              请使用顶部工具栏的
              <br />
              "上传图片" 按钮上传图片
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePanel;