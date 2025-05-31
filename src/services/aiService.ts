import { DiagramElement, AIResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

// 使用新的API配置
const _token_b64 = "QUl6YVN5QzV6Q2dYWHdDTmJVbWJRUl9waFJ0bWNpUlNCckNjRHFn";
const token = atob(_token_b64);
const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent";

// 将图片转换为base64格式
const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data:image/...;base64,前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 分析图像并生成图表元素
export const analyzeImageAndGenerateDiagram = async (imageFile: File): Promise<AIResponse> => {
  try {
    console.log('Starting image analysis...');
    console.log('Image file size:', imageFile.size, 'bytes');
    console.log('Image file type:', imageFile.type);
    
    // 转换图片为base64
    const imageBase64 = await imageToBase64(imageFile);
    console.log('Image converted to base64, length:', imageBase64.length);
    
    // 构建提示词
    const prompt = `
请分析这张图片中的图表或图形，并将其转换为可交互的图表元素。请按照以下要求：

1. 识别图片中的所有图形元素（文本框、形状、箭头、连接线等）
2. 提取每个元素的位置、大小、文本内容、颜色等属性
3. 将所有文本翻译为中文
4. 删除图片编号（如"图1-1"等），保留正文内容
5. 按照九宫格布局原则重新排列元素

请以JSON格式返回结果，包含以下结构：
{
  "elements": [
    {
      "id": "唯一标识符",
      "type": "元素类型(text/box/circle/arrow)",
      "x": "x坐标(0-800)",
      "y": "y坐标(0-600)",
      "width": "宽度",
      "height": "高度",
      "text": "文本内容(中文)",
      "color": "文字颜色",
      "backgroundColor": "背景颜色",
      "borderColor": "边框颜色",
      "fontSize": "字体大小",
      "visible": true
    }
  ],
  "connections": [
    {
      "id": "连接线ID",
      "fromElementId": "起始元素ID",
      "toElementId": "目标元素ID",
      "type": "straight",
      "style": "solid",
      "arrowType": "arrow",
      "visible": true
    }
  ],
  "description": "图表描述"
}

请确保返回的是有效的JSON格式，不要包含任何其他文本。
`;
    
    console.log('Sending request to Gemini API...');
    
    // 使用新的API调用方式
    const response = await fetch(`${endpoint}?key=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Received response from Gemini API');
    console.log('Response length:', text.length);
    console.log('Response preview:', text.substring(0, 200) + '...');
    
    // 解析JSON响应
    try {
      // 清理响应文本，移除可能的markdown格式
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const aiResponse: AIResponse = JSON.parse(cleanText);
      
      // 验证和修正响应数据
      if (!aiResponse.elements || !Array.isArray(aiResponse.elements)) {
        throw new Error('Invalid response: missing or invalid elements array');
      }
      
      // 为每个元素添加默认值和唯一ID
      aiResponse.elements = aiResponse.elements.map(element => ({
        id: element.id || uuidv4(),
        type: element.type || 'text',
        x: Math.max(0, Math.min(800, element.x || 100)),
        y: Math.max(0, Math.min(600, element.y || 100)),
        width: Math.max(50, element.width || 120),
        height: Math.max(30, element.height || 40),
        text: element.text || '文本',
        color: element.color || '#333333',
        backgroundColor: element.backgroundColor || '#ffffff',
        borderColor: element.borderColor || '#cccccc',
        borderWidth: element.borderWidth || 1,
        fontSize: element.fontSize || 14,
        fontWeight: element.fontWeight || 'normal',
        visible: element.visible !== false,
        rotation: element.rotation || 0,
        zIndex: element.zIndex || 1
      }));
      
      // 处理连接线
      if (aiResponse.connections && Array.isArray(aiResponse.connections)) {
        aiResponse.connections = aiResponse.connections.map(conn => ({
          id: conn.id || uuidv4(),
          fromElementId: conn.fromElementId,
          toElementId: conn.toElementId,
          type: conn.type || 'straight',
          style: conn.style || 'solid',
          arrowType: conn.arrowType || 'arrow',
          color: conn.color || '#333333',
          width: conn.width || 2,
          visible: conn.visible !== false
        }));
      } else {
        aiResponse.connections = [];
      }
      
      console.log('Successfully parsed AI response');
      console.log('Elements count:', aiResponse.elements.length);
      console.log('Connections count:', aiResponse.connections.length);
      
      return aiResponse;
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', text);
      
      // 返回默认的测试元素
      return createFallbackResponse();
    }
    
  } catch (error) {
    console.error('Error in analyzeImageAndGenerateDiagram:', error);
    
    // 根据错误类型提供更详细的错误信息
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API密钥配置错误，请检查Gemini API密钥设置');
      } else if (error.message.includes('quota')) {
        throw new Error('API配额已用完，请稍后再试或检查账户配额');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('网络连接错误，请检查网络连接后重试');
      }
    }
    
    // 返回默认的测试元素作为后备方案
    console.log('Returning fallback response due to error');
    return createFallbackResponse();
  }
};

// 创建后备响应（用于测试和错误情况）
const createFallbackResponse = (): AIResponse => {
  return {
    elements: [
      {
        id: uuidv4(),
        type: 'box',
        x: 100,
        y: 100,
        width: 120,
        height: 60,
        text: '开始',
        color: '#333333',
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
        borderWidth: 2,
        fontSize: 16,
        fontWeight: 'bold',
        visible: true,
        rotation: 0,
        zIndex: 1
      },
      {
        id: uuidv4(),
        type: 'box',
        x: 300,
        y: 200,
        width: 140,
        height: 80,
        text: '处理数据',
        color: '#333333',
        backgroundColor: '#fff3e0',
        borderColor: '#ff9800',
        borderWidth: 2,
        fontSize: 14,
        fontWeight: 'normal',
        visible: true,
        rotation: 0,
        zIndex: 1
      },
      {
        id: uuidv4(),
        type: 'circle',
        x: 500,
        y: 350,
        width: 100,
        height: 100,
        text: '结束',
        color: '#ffffff',
        backgroundColor: '#4caf50',
        borderColor: '#388e3c',
        borderWidth: 2,
        fontSize: 16,
        fontWeight: 'bold',
        visible: true,
        rotation: 0,
        zIndex: 1
      }
    ],
    connections: [],
    description: '这是一个示例流程图，展示了基本的处理流程。您可以拖拽、编辑这些元素。'
  };
};

// 生成基于文本描述的图表
export const generateDiagramFromText = async (description: string): Promise<AIResponse> => {
  try {
    console.log('Generating diagram from text description...');
    
    const prompt = `
根据以下描述生成一个图表："${description}"

请创建合适的图表元素，包括文本框、形状、连接线等。请以JSON格式返回结果，格式与图像分析相同。

要求：
1. 元素位置合理，符合逻辑流程
2. 使用中文文本
3. 颜色搭配美观
4. 包含适当的连接线

返回JSON格式，不要包含其他文本。
`;
    
    const response = await fetch(`${endpoint}?key=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 解析响应
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const aiResponse: AIResponse = JSON.parse(cleanText);
    
    // 验证和修正数据（与图像分析相同的处理逻辑）
    // ... 这里可以复用上面的验证逻辑
    
    return aiResponse;
    
  } catch (error) {
    console.error('Error generating diagram from text:', error);
    return createFallbackResponse();
  }
};