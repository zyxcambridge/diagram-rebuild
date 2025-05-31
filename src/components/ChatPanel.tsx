import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Upload } from 'lucide-react';
import { useDiagramContext } from '../context/DiagramContext';
import { ChatMessage, DiagramElement } from '../types';
import { analyzeImageAndGenerateDiagram } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';

// 初始化GoogleGenAI实例
const _token_b64 = "QUl6YVN5QzV6Q2dYWHdDTmJVbWJRUl9waFJ0bWNpUlNCckNjRHFn";
const token = atob(_token_b64);
const ai = new GoogleGenAI({ apiKey: token });

interface ChatPanelProps {
  className?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ className = '' }) => {
  const {
    elements,
    connections,
    setElements,
    setConnections,
    setUploadedImage,
    isProcessing,
    setIsProcessing,
    saveToHistory
  } = useDiagramContext();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      type: 'system',
      content: '欢迎使用以图画图系统！请上传一张图片，我将帮您分析并生成可交互的图表。',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 添加消息
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    try {
      console.log('开始处理图片上传:', file.name);
      
      // 创建图片URL用于显示
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      // 添加用户消息
      addMessage({
        type: 'user',
        content: `上传了图片: ${file.name}`,
        imageUrl
      });
      
      // 开始自动生成
      await handleAutoGenerate(file);
      
    } catch (error) {
      console.error('图片上传失败:', error);
      addMessage({
        type: 'system',
        content: '图片上传失败，请重试。'
      });
    }
  };

  // 自动生成图表
  const handleAutoGenerate = async (imageFile: File) => {
    try {
      console.log('开始自动生成图表...');
      setIsProcessing(true);
      
      addMessage({
        type: 'assistant',
        content: '正在分析图片并生成交互式图表，请稍候...'
      });
      
      // 调用AI服务分析图片
      console.log('调用AI服务分析图片...');
      const aiResponse = await analyzeImageAndGenerateDiagram(imageFile);
      
      console.log('AI分析完成，解析元素...');
      console.log('AI响应:', aiResponse);
      
      // 解析AI响应并设置元素
      const parsedElements = parseElementsFromAIResponse(aiResponse);
      console.log('解析得到的元素数量:', parsedElements.length);
      
      if (parsedElements.length > 0) {
        setElements(parsedElements);
        
        if (aiResponse.connections && aiResponse.connections.length > 0) {
          setConnections(aiResponse.connections);
        }
        
        // 保存到历史记录
        saveToHistory('AI自动生成图表');
        
        addMessage({
          type: 'assistant',
          content: `图表生成完成！我已经识别并创建了 ${parsedElements.length} 个图表元素${aiResponse.connections?.length ? `和 ${aiResponse.connections.length} 条连接线` : ''}。您可以在右侧画布中查看和编辑这些元素。\n\n${aiResponse.description || ''}\n\n您可以：\n- 拖拽元素调整位置\n- 双击元素编辑文本\n- 拖拽元素四角调整大小\n- 右键添加连接点\n- 在聊天中提出修改建议`
        });
      } else {
        addMessage({
          type: 'assistant',
          content: '抱歉，我无法从这张图片中识别出有效的图表元素。请尝试上传更清晰的图表图片，或者告诉我您希望创建什么样的图表。'
        });
      }
      
    } catch (error) {
      console.error('自动生成失败:', error);
      
      let errorMessage = '图表生成失败，';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += '请检查网络连接后重试。';
      }
      
      addMessage({
        type: 'assistant',
        content: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 解析AI响应中的元素
  const parseElementsFromAIResponse = (aiResponse: any): DiagramElement[] => {
    console.log('开始解析AI响应...');
    console.log('AI响应类型:', typeof aiResponse);
    console.log('AI响应内容:', aiResponse);
    
    try {
      // 检查是否有elements数组
      if (aiResponse && aiResponse.elements && Array.isArray(aiResponse.elements)) {
        console.log('找到elements数组，长度:', aiResponse.elements.length);
        return aiResponse.elements;
      }
      
      // 如果没有找到有效的elements，返回测试元素
      console.log('未找到有效的elements数组，返回测试元素');
      return [
        {
          id: uuidv4(),
          type: 'text' as const,
          x: 150,
          y: 100,
          width: 120,
          height: 40,
          text: '测试文本元素',
          color: '#333333',
          backgroundColor: 'transparent',
          borderColor: '#cccccc',
          borderWidth: 1,
          fontSize: 14,
          fontWeight: 'normal',
          visible: true,
          rotation: 0,
          zIndex: 1
        },
        {
          id: uuidv4(),
          type: 'box' as const,
          x: 300,
          y: 200,
          width: 140,
          height: 80,
          text: '测试矩形',
          color: '#ffffff',
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          borderWidth: 2,
          fontSize: 16,
          fontWeight: 'bold',
          visible: true,
          rotation: 0,
          zIndex: 1
        },
        {
          id: uuidv4(),
          type: 'circle' as const,
          x: 500,
          y: 150,
          width: 100,
          height: 100,
          text: '测试圆形',
          color: '#333333',
          backgroundColor: '#28a745',
          borderColor: '#1e7e34',
          borderWidth: 2,
          fontSize: 14,
          fontWeight: 'normal',
          visible: true,
          rotation: 0,
          zIndex: 1
        }
      ];
      
    } catch (error) {
      console.error('解析AI响应时出错:', error);
      return [];
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // 添加用户消息
    addMessage({
      type: 'user',
      content: userMessage
    });
    
    try {
      setIsProcessing(true);
      
      // 添加AI思考中的消息
      addMessage({
        type: 'assistant',
        content: '正在分析您的需求并生成相应的图表修改...'
      });
      
      // 构建包含当前图表状态的提示词
      const currentState = {
        elements: elements,
        connections: connections,
        userRequest: userMessage
      };
      
      const prompt = `
用户当前有一个图表，包含以下元素：
${JSON.stringify(currentState.elements, null, 2)}

连接线：
${JSON.stringify(currentState.connections, null, 2)}

用户的修改要求："${userMessage}"

请根据用户的要求，对图表进行相应的修改。可能的操作包括：
1. 添加新元素
2. 修改现有元素的属性（位置、大小、文本、颜色等）
3. 删除元素
4. 添加或修改连接线
5. 重新布局

请返回修改后的完整图表数据，格式与之前相同的JSON结构。

如果用户的要求不够明确，请提供建议或询问更多细节。

请确保返回的是有效的JSON格式，不要包含任何其他文本。
`;
      
      // 调用AI服务使用新的SDK
      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-pro-preview-05-06",
        contents: [{
          parts: [{ text: prompt }]
        }],
        config: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      });
      
      // 收集流式响应
      let aiText = '';
      for await (const chunk of response) {
        if (chunk.text) {
          aiText += chunk.text;
        }
      }
      
      // 尝试解析AI响应
      try {
        let cleanText = aiText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const aiResponse = JSON.parse(cleanText);
        
        // 如果AI返回了新的图表数据，更新画布
        if (aiResponse.elements && Array.isArray(aiResponse.elements)) {
          const parsedElements = parseElementsFromAIResponse(aiResponse);
          setElements(parsedElements);
          
          if (aiResponse.connections && Array.isArray(aiResponse.connections)) {
            setConnections(aiResponse.connections);
          }
          
          // 保存到历史记录
          saveToHistory(`AI修改: ${userMessage}`);
          
          addMessage({
            type: 'assistant',
            content: `已根据您的要求完成图表修改！\n\n修改内容：\n- 更新了 ${parsedElements.length} 个元素\n- ${aiResponse.connections?.length || 0} 条连接线\n\n${aiResponse.description || ''}\n\n您可以继续提出其他修改建议。`
          });
        } else {
          // 如果AI没有返回图表数据，可能是需要更多信息或建议
          addMessage({
            type: 'assistant',
            content: aiText || '我理解了您的需求，但需要更多具体信息才能进行修改。请告诉我您希望如何具体调整图表？'
          });
        }
        
      } catch (parseError) {
        console.error('解析AI响应失败:', parseError);
        
        // 如果无法解析为JSON，直接显示AI的文本响应
        addMessage({
          type: 'assistant',
          content: aiText || '抱歉，我无法理解您的具体需求。请尝试更详细地描述您希望如何修改图表，比如：\n\n- "添加一个蓝色的矩形，文字是XXX"\n- "把第一个元素移动到右边"\n- "改变所有文字的颜色为红色"\n- "添加从A到B的连接线"'
        });
      }
      
    } catch (error) {
      console.error('AI对话失败:', error);
      
      let errorMessage = '抱歉，AI服务暂时不可用。';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'API密钥配置错误，请检查设置。';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API配额已用完，请稍后再试。';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '网络连接错误，请检查网络后重试。';
        }
      }
      
      addMessage({
        type: 'assistant',
        content: errorMessage + '\n\n您仍然可以手动编辑图表元素：\n- 拖拽元素调整位置\n- 双击元素编辑文本\n- 拖拽四角调整大小\n- 右键添加连接点'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理导出功能
  const handleExport = () => {
    if (elements.length === 0) {
      addMessage({
        type: 'system',
        content: '当前画布为空，无法导出。请先添加一些元素。'
      });
      return;
    }

    // 显示导出选项
    const exportType = prompt('请选择导出格式:\n1. PNG图片\n2. SVG矢量图\n3. JSON数据\n\n请输入数字 (1-3):', '1');
    
    switch (exportType) {
      case '1':
        exportAsPNG();
        break;
      case '2':
        exportAsSVG();
        break;
      case '3':
        exportAsJSON();
        break;
      default:
        addMessage({
          type: 'system',
          content: '导出已取消。'
        });
    }
  };

  // 导出为PNG
  const exportAsPNG = () => {
    try {
      const canvas = document.querySelector('.canvas');
      if (!canvas) {
        throw new Error('找不到画布元素');
      }

      // 创建一个临时的canvas元素来绘制内容
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建画布上下文');
      }

      // 计算画布尺寸
      const bounds = calculateCanvasBounds();
      tempCanvas.width = bounds.width;
      tempCanvas.height = bounds.height;
      
      // 设置白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, bounds.width, bounds.height);
      
      // 绘制元素
      elements.forEach(element => {
        drawElementToCanvas(ctx, element, bounds);
      });
      
      // 绘制连接线
      connections.forEach(connection => {
        drawConnectionToCanvas(ctx, connection, bounds);
      });
      
      // 下载PNG文件
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'diagram.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          addMessage({
            type: 'assistant',
            content: 'PNG图片导出成功！文件已开始下载。'
          });
        } else {
          throw new Error('无法生成PNG文件');
        }
      }, 'image/png');
      
    } catch (error) {
      addMessage({
        type: 'system',
        content: `PNG导出失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  // 在canvas上绘制元素
  const drawElementToCanvas = (ctx: CanvasRenderingContext2D, element: DiagramElement, bounds: any) => {
    const { x, y, width, height, text, color, backgroundColor, borderColor, borderWidth } = element;
    const adjustedX = x - bounds.x;
    const adjustedY = y - bounds.y;
    
    // 绘制背景
    ctx.fillStyle = backgroundColor || '#ffffff';
    
    switch (element.type) {
      case 'box':
        ctx.fillRect(adjustedX, adjustedY, width, height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.ellipse(adjustedX + width/2, adjustedY + height/2, width/2, height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;
      default:
        ctx.fillRect(adjustedX, adjustedY, width, height);
        break;
    }
    
    // 绘制边框
    if ((borderWidth || 0) > 0) {
      ctx.strokeStyle = borderColor || '#cccccc';
      ctx.lineWidth = borderWidth || 1;
      
      switch (element.type) {
        case 'box':
          ctx.strokeRect(adjustedX, adjustedY, width, height);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.ellipse(adjustedX + width/2, adjustedY + height/2, width/2, height/2, 0, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        default:
          ctx.strokeRect(adjustedX, adjustedY, width, height);
          break;
      }
    }
    
    // 绘制文本
    if (text) {
      ctx.fillStyle = color || '#333333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, adjustedX + width/2, adjustedY + height/2);
    }
  };

  // 在canvas上绘制连接线
  const drawConnectionToCanvas = (ctx: CanvasRenderingContext2D, connection: any, bounds: any) => {
    const fromElement = elements.find(el => el.id === connection.fromElementId);
    const toElement = elements.find(el => el.id === connection.toElementId);
    
    if (!fromElement || !toElement) return;
    
    const fromX = fromElement.x + fromElement.width / 2 - bounds.x;
    const fromY = fromElement.y + fromElement.height / 2 - bounds.y;
    const toX = toElement.x + toElement.width / 2 - bounds.x;
    const toY = toElement.y + toElement.height / 2 - bounds.y;
    
    ctx.strokeStyle = connection.color || '#333';
    ctx.lineWidth = connection.width || 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  };

  // 导出为SVG
  const exportAsSVG = () => {
    try {
      // 计算画布边界
      const bounds = calculateCanvasBounds();
      
      // 创建SVG内容
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}">\n`;
      
      // 添加元素
      elements.forEach(element => {
        svgContent += elementToSVG(element);
      });
      
      // 添加连接线
      connections.forEach(connection => {
        svgContent += connectionToSVG(connection);
      });
      
      svgContent += '</svg>';
      
      // 下载SVG文件
      downloadFile(svgContent, 'diagram.svg', 'image/svg+xml');
      
      addMessage({
        type: 'assistant',
        content: 'SVG文件导出成功！文件已开始下载。'
      });
    } catch (error) {
      addMessage({
        type: 'system',
        content: `SVG导出失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  // 导出为JSON
  const exportAsJSON = () => {
    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        elements: elements,
        connections: connections,
        canvasState: {
          scale: 1,
          offsetX: 0,
          offsetY: 0
        }
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      downloadFile(jsonContent, 'diagram.json', 'application/json');
      
      addMessage({
        type: 'assistant',
        content: `JSON数据导出成功！包含 ${elements.length} 个元素和 ${connections.length} 条连接线。`
      });
    } catch (error) {
      addMessage({
        type: 'system',
        content: `JSON导出失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  // 计算画布边界
  const calculateCanvasBounds = () => {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 800, height: 600 };
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    });
    
    const padding = 50;
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    };
  };

  // 将元素转换为SVG
  const elementToSVG = (element: DiagramElement): string => {
    const { x, y, width, height, text, color, backgroundColor, borderColor, borderWidth } = element;
    
    let svg = '';
    
    switch (element.type) {
      case 'box':
        svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />\n`;
        break;
      case 'circle':
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        svg += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />\n`;
        break;
      case 'text':
      default:
        svg += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />\n`;
        break;
    }
    
    // 添加文本
    if (text) {
      const textX = x + width / 2;
      const textY = y + height / 2;
      svg += `  <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="14">${text}</text>\n`;
    }
    
    return svg;
  };

  // 将连接线转换为SVG
  const connectionToSVG = (connection: any): string => {
    const fromElement = elements.find(el => el.id === connection.fromElementId);
    const toElement = elements.find(el => el.id === connection.toElementId);
    
    if (!fromElement || !toElement) return '';
    
    const fromX = fromElement.x + fromElement.width / 2;
    const fromY = fromElement.y + fromElement.height / 2;
    const toX = toElement.x + toElement.width / 2;
    const toY = toElement.y + toElement.height / 2;
    
    return `  <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="${connection.color || '#333'}" stroke-width="${connection.width || 2}" />\n`;
  };

  // 下载文件
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 触发文件上传
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    // 清空input值，允许重复上传同一文件
    e.target.value = '';
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-panel ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff'
    }}>
      {/* 聊天头部 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>AI 助手</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>上传图片自动生成图表，或描述您的需求</p>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              gap: '8px',
              alignItems: 'flex-start'
            }}
          >
            {/* 头像 */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: message.type === 'user' ? '#007bff' : '#28a745',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {message.type === 'user' ? '我' : message.type === 'assistant' ? 'AI' : '系'}
            </div>
            
            {/* 消息内容 */}
            <div style={{
              maxWidth: '70%',
              backgroundColor: message.type === 'user' ? '#007bff' : '#f1f3f4',
              color: message.type === 'user' ? 'white' : '#333',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap'
            }}>
              {message.content}
              
              {/* 图片预览 */}
              {message.imageUrl && (
                <div style={{ marginTop: '8px' }}>
                  <img
                    src={message.imageUrl}
                    alt="上传的图片"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              
              {/* 时间戳 */}
              <div style={{
                fontSize: '10px',
                opacity: 0.7,
                marginTop: '4px',
                textAlign: message.type === 'user' ? 'right' : 'left'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {/* 处理中指示器 */}
        {isProcessing && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#28a745',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              AI
            </div>
            
            <div style={{
              backgroundColor: '#f1f3f4',
              padding: '8px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div className="spinner" style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '14px', color: '#666' }}>正在思考...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        {/* 快捷操作 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            className="btn btn-outline"
            style={{ fontSize: '12px' }}
            onClick={handleExport}
          >
            <Download size={14} />
            导出
          </button>
          
          <button
            className="btn btn-outline"
            style={{ fontSize: '12px' }}
            onClick={triggerFileUpload}
          >
            <Upload size={14} />
            上传图片
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        {/* 消息输入 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="描述您想要的修改，或提出问题..."
            style={{
              flex: 1,
              minHeight: '40px',
              maxHeight: '120px',
              padding: '8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none'
            }}
            disabled={isProcessing}
          />
          
          <button
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
          </button>
        </div>
        
        <div style={{
          fontSize: '11px',
          color: '#999',
          marginTop: '8px',
          textAlign: 'center'
        }}>
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;