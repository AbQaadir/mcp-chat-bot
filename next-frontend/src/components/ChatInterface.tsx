'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, uploadFiles } from '../utils/api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  mcpResponse?: string; // Store MCP tool response separately
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [currentMcpResponse, setCurrentMcpResponse] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [selectedMcpResponse, setSelectedMcpResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentBotMessage]);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('files', file));

      const response = await uploadFiles(formData);
      const uploadMessage: Message = {
        sender: 'bot',
        text: `✅ ${response.message || 'Files uploaded successfully'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, uploadMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: '❌ Upload failed. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { 
      sender: 'user', 
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setCurrentBotMessage('');

    try {
      let botResponse = '';
      let mcpResponse = '';
      console.log('Starting chat message send...');
      
      await sendChatMessage(input, (chunk: string) => {
        console.log('Received chunk:', chunk);
        
        // Check if this chunk is an MCP tool response
        if (chunk.trim().startsWith('[') && chunk.trim().endsWith(']')) {
          try {
            // Parse and format the MCP response for better display
            const parsed = JSON.parse(chunk);
            const formattedMcp = JSON.stringify(parsed, null, 2);
            mcpResponse += formattedMcp;
            setCurrentMcpResponse(mcpResponse);
            console.log('MCP Response detected:', chunk);
            return; // Don't add MCP response to the main message
          } catch (e) {
            // If JSON parsing fails, treat as regular response
            console.log('Failed to parse MCP response as JSON, treating as regular chunk');
          }
        }
        
        botResponse += chunk;
        
        // Clean up the response to remove user input duplication
        let cleanedResponse = botResponse;
        if (cleanedResponse.startsWith(input)) {
          cleanedResponse = cleanedResponse.substring(input.length);
        }
        
        setCurrentBotMessage(cleanedResponse);
        console.log('Updated bot message to:', cleanedResponse);
      });

      // Final cleanup of the response
      let finalResponse = botResponse;
      if (finalResponse.startsWith(input)) {
        finalResponse = finalResponse.substring(input.length);
      }
      
      console.log('Final bot response:', finalResponse);
      console.log('Final MCP response:', mcpResponse);
      
      const botMessage: Message = { 
        sender: 'bot', 
        text: finalResponse.trim(),
        timestamp: new Date(),
        mcpResponse: mcpResponse.trim() || undefined
      };
      setMessages(prev => [...prev, botMessage]);
      setCurrentBotMessage('');
      setCurrentMcpResponse('');
    } catch (error) {
      console.error("Chat failed:", error);
      const errorMessage: Message = { 
        sender: 'bot', 
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentBotMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>AI Resume Assistant</h1>
        <p>Upload resumes and chat about candidates</p>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && !currentBotMessage && (
          <div className="welcome-message">
            <h2>What&apos;s on your mind today?</h2>
            <p>Upload PDFs or just start chatting to get help with resume analysis</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className={`message ${msg.sender}`}>
              <ReactMarkdown
                components={{
                  code: ({ children, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <pre>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
              <div className="message-footer">
                <span className="message-time">{formatTime(msg.timestamp)}</span>
                {msg.mcpResponse && (
                  <button
                    className="mcp-button"
                    onClick={() => {
                      setSelectedMcpResponse(msg.mcpResponse!);
                      setShowMcpModal(true);
                    }}
                    title="View MCP Tool Response"
                  >
                    🔧
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {currentBotMessage && (
          <div className="message-wrapper bot">
            <div className="message bot streaming">
              <ReactMarkdown
                components={{
                  code: ({ children, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <pre>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {currentBotMessage}
              </ReactMarkdown>
              <div className="message-footer">
                {currentMcpResponse && (
                  <button
                    className="mcp-button"
                    onClick={() => {
                      setSelectedMcpResponse(currentMcpResponse);
                      setShowMcpModal(true);
                    }}
                    title="View MCP Tool Response"
                  >
                    🔧
                  </button>
                )}
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="input-wrapper">
            <button
              type="button"
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload PDF"
            >
              {isUploading ? '⏳' : '📎'}
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="chat-input"
            />
            
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* MCP Response Modal */}
      {showMcpModal && (
        <div className="mcp-modal-overlay" onClick={() => setShowMcpModal(false)}>
          <div className="mcp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mcp-modal-header">
              <h3>🔧 MCP Tool Response</h3>
              <button 
                className="mcp-modal-close"
                onClick={() => setShowMcpModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="mcp-modal-content">
              <pre>{selectedMcpResponse}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
