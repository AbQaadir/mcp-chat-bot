# Resume Processing Frontend

A modern Next.js chatbot interface for resume processing and AI-powered chat with streaming responses.

## ✨ Features

- **Modern Chatbot UI**: Clean, responsive design similar to popular chat applications
- **File Upload Integration**: Upload PDFs directly within the chat interface using the 📎 button
- **Streaming Chat**: Real-time streaming responses from the AI backend
- **Message History**: All past conversations are preserved and displayed
- **Markdown Support**: Rich text rendering for formatted responses
- **No Upload Required**: Users can chat without uploading files
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Automatic dark/light theme detection

## 🚀 Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Setup

#### Using Docker Compose (Recommended)

The frontend is integrated into the main docker-compose.yaml file:

```bash
# From the main assignment directory
docker-compose up -d
```

Access the application:
- **Frontend**: http://localhost:3001
- **API**: http://localhost:8000
- **Database**: localhost:5432

#### Standalone Docker

```bash
# Build the image
docker build -t next-frontend .

# Run the container
docker run -p 3001:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 next-frontend
```

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### Backend Integration

This frontend communicates with the FastAPI backend service through:

- **Upload Endpoint**: `POST /upload` - Multipart form data with PDF files
- **Chat Endpoint**: `POST /chat` - Streaming chat responses with Server-Sent Events

## 📱 Usage

1. **Start Chatting**: Type any message in the input field at the bottom
2. **Upload PDFs**: Click the 📎 (paperclip) button to upload resume files
3. **View History**: All messages are preserved and displayed in chronological order
4. **Streaming Responses**: Watch as AI responses appear in real-time

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css      # Modern chatbot styling
│   └── page.tsx         # Main app container
├── components/
│   └── ChatInterface.tsx # Main chat component with upload
└── utils/
    └── api.ts           # API communication with streaming
```

## 🐳 Docker Integration

The frontend is integrated into your existing Docker Compose setup:

- **Service name**: `frontend`
- **Port mapping**: `3001:3000` (to avoid conflict with fastmcp-server)
- **Dependencies**: Waits for the API service to be ready
- **Network**: Connected to `app_network` for internal communication

## 🔄 API Communication

### Chat Streaming
```typescript
await sendChatMessage(message, (chunk: string) => {
  // Handle streaming chunks in real-time
  setCurrentBotMessage(prev => prev + chunk);
});
```

### File Upload
```typescript
const formData = new FormData();
Array.from(files).forEach(file => formData.append('files', file));
await uploadFiles(formData);
```
