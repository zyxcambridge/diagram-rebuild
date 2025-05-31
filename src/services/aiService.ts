import { AIResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

import { GoogleGenAI } from "@google/genai";

// 使用新的API配置
const _token_b64 = "QUl6YVN5QzV6Q2dYWHdDTmJVbWJRUl9waFJ0bWNpUlNCckNjRHFn";
const token = atob(_token_b64);

// 初始化GoogleGenAI实例
const ai = new GoogleGenAI({ apiKey: token });

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
基于所附图示内容，使用HTML来完整复现原图所表达的信息结构与视觉布局，并提供以下增强功能：

【重要】：生成的元素必须确保拖拽后不会消失，每个元素都要有稳定的DOM结构和正确的坐标定位。

1. 结构分析与分解原则：

为便于开发与管理，首先对整张图进行逻辑划分：
	• 纵向划分：将整图划分为上、中、下三个水平区域；
	• 横向划分：再将每个区域进一步细分为左、中、右三个垂直子区；
	• 形成总计9个区域的"九宫格"结构，每个区域内部逐个绘制原图中的元素节点。

2. 元素级别的绘制要求：
	• 每个元素节点需以HTML DOM元素形式表示（如<div>、<svg>等）；
	• 每个节点都应保留原图的相对位置、大小、文字信息、颜色与风格；
	• 原图中的"图x-y"编号一律删除，保留正文内容与结构逻辑；
	• 所有文本翻译为中文，以符合本地化出版需求；
	• 每个元素必须有明确的边框线框，便于拖拽操作。

3. 交互功能增强（关键要求）：

【核心问题解决】：拖动后元素绝对不能消失！每个元素必须：
	• 具备稳定的DOM结构和唯一ID
	• 拖拽时保持元素的完整性和可见性
	• 拖拽结束后元素必须保持在新位置并继续可见

每个图中元素均应具备以下交互能力：
	• ✅ 可拖拽：用户可任意拖动节点进行布局调整，拖拽后元素必须保持可见且功能正常；
	• ✅ 点击隐藏/显示：点击任一元素，可切换其显示与隐藏状态；
	• ✅ 缩放功能：用户可对任意元素进行局部放大或缩小；
	• ✅ 连接线管理：所有连接线可以显示或隐藏，每个元素外部增加线框；
	• ✅ 连接线创建：右键在元素边框上时，可以增加链接线，鼠标指向另一个元素时产生连接线。

4. 构建顺序建议：

为确保构建过程的清晰与高效，建议遵循以下顺序进行：
	1. 优先绘制图中所有独立元素节点，确保每个元素有稳定的结构；
	2. 为每个元素添加基础交互功能，特别是拖拽功能的稳定性；
	3. 识别元素之间的逻辑/信息连接关系，绘制连接线；
	4. 整合为完整图形系统，保证布局一致性与交互完整性；
	5. 最终调优：语言翻译、样式统一、响应式支持、细节微调。

5. 出版图表规范与注意事项：
	1. 图示中的字号要用小五号黑体（对应fontSize: 12-14）；
	2. 线条的衔接要准确，线条的粗细和箭头的形状要美观；
	3. 黑白印刷的图书，绘制图表切忌用各色底纹，印刷后影响图片质量；
	4. 文本的字体、字号、颜色、字型和位置要恰到好处；
	5. 每个元素都要有清晰的边框，便于用户识别和操作。

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
      "fontSize": "字体大小(小五号黑体)",
      "visible": true
    }
  ],
  "connections": [
    {
      "id": "连接线ID",
      "fromElementId": "起始元素ID",
      "toElementId": "目标元素ID",
      "lineType": "straight",
      "lineStyle": "solid",
      "arrowType": "single",
      "color": "#333333",
      "width": 2,
      "visible": true
    }
  ],
  "description": "图表描述"
}

请确保返回的是有效的JSON格式，不要包含任何其他文本。
`;
    
    console.log('Sending request to Gemini API using new SDK...');
    
    // 使用新的GoogleGenAI SDK调用方式
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-pro-preview-05-06",
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: imageFile.type,
              data: imageBase64
            }
          }
        ]
      }],
      config: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    });
    
    // 收集流式响应
    let text = '';
    for await (const chunk of response) {
      if (chunk.text) {
        text += chunk.text;
      }
    }
    
    console.log('Received response from Gemini API');
    console.log('Response length:', text.length);
    console.log('Response preview:', text.substring(0, 200) + '...');
    
    // 解析JSON响应
    try {
      // 清理响应文本，移除可能的markdown格式和其他干扰内容
      let cleanText = text.trim();
      
      // 移除markdown代码块标记
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // 查找JSON对象的开始和结束位置
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      // 移除可能的前缀文本（如冒号开头的内容）
      if (cleanText.startsWith(':')) {
        const firstBrace = cleanText.indexOf('{');
        if (firstBrace !== -1) {
          cleanText = cleanText.substring(firstBrace);
        }
      }
      
      console.log('Cleaned text for parsing:', cleanText.substring(0, 200) + '...');
      
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
        const processedConnections = aiResponse.connections.map(conn => ({
          id: conn.id || uuidv4(),
          fromElementId: conn.fromElementId,
          toElementId: conn.toElementId,
          lineType: conn.lineType || 'straight',
          lineStyle: conn.lineStyle || 'solid',
          arrowType: (conn.arrowType as any) || 'single',
          color: conn.color || '#333333',
          width: conn.width || 2,
          visible: conn.visible !== false
        }));
        
        console.log('Successfully parsed AI response');
        console.log('Elements count:', aiResponse.elements.length);
        console.log('Connections count:', processedConnections.length);
        
        return { ...aiResponse, connections: processedConnections };
      } else {
        console.log('Successfully parsed AI response');
        console.log('Elements count:', aiResponse.elements.length);
        console.log('Connections count:', 0);
        
        return { ...aiResponse, connections: [] };
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', text);
      
      // 抛出解析错误，不返回示例数据
      throw new Error(`AI响应解析失败: ${(parseError as Error).message}. 原始响应: ${text.substring(0, 500)}...`);
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
    
    // 抛出错误，不返回示例数据
    throw error;
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
    let text = '';
    for await (const chunk of response) {
      if (chunk.text) {
        text += chunk.text;
      }
    }
    
    // 解析响应
    let cleanText = text.trim();
    
    // 移除markdown代码块标记
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // 查找JSON对象的开始和结束位置
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    }
    
    // 移除可能的前缀文本（如冒号开头的内容）
    if (cleanText.startsWith(':')) {
      const firstBrace = cleanText.indexOf('{');
      if (firstBrace !== -1) {
        cleanText = cleanText.substring(firstBrace);
      }
    }
    
    console.log('Cleaned text for parsing:', cleanText.substring(0, 200) + '...');
    
    const aiResponse: AIResponse = JSON.parse(cleanText);
    
    // 验证和修正数据（与图像分析相同的处理逻辑）
    // ... 这里可以复用上面的验证逻辑
    
    return aiResponse;
    
  } catch (error) {
    console.error('Error generating diagram from text:', error);
    return createFallbackResponse();
  }
};