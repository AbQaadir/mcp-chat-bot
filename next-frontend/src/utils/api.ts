const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const uploadFiles = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const sendChatMessage = async (
  message: string,
  onChunk: (chunk: string) => void
) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, stream: true }),
  });

  if (!response.ok) throw new Error('Chat failed');
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (reader) {
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const parsed = JSON.parse(line);
          // Check for both 'chunk' and 'response' fields
          const content = parsed.chunk || parsed.response;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          console.log('Failed to parse line:', line, e);
          // Skip invalid JSON
        }
      }
    }
  }
};
