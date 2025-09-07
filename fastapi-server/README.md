# Resume Processing API

A FastAPI-based microservice for processing and ingesting PDF resumes into a vector database for semantic search and retrieval. This system uses async task processing with Celery and stores document embeddings in PostgreSQL with pgvector extension.

## 🚀 Features

- **PDF Resume Upload**: Multi-file upload endpoint for processing PDF resumes
- **Async Processing**: Background task processing using Celery with Redis broker
- **Vector Storage**: Document embeddings stored in PostgreSQL with pgvector
- **Semantic Search**: Uses Google Generative AI embeddings for document similarity
- **Scalable Architecture**: Containerized with Docker for easy deployment
- **Text Chunking**: Intelligent document splitting for optimal embedding generation

## 🏗️ Architecture

This is a complete microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI       │    │     Celery      │    │   PostgreSQL    │
│   Resume API    │───▶│    Worker       │───▶│   + pgvector    │
│   (Port 8000)   │    │                 │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         ▼              ┌─────────────────┐               │
┌─────────────────┐     │     Redis       │               │
│   Shared File   │     │    Message      │               │
│   Storage       │     │    Broker       │               │
│   (Volume)      │     │   (Port 6379)   │               │
└─────────────────┘     └─────────────────┘               │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐               │
         │              │     Flower      │               │
         │              │   Monitoring    │               │
         │              │   (Port 5555)   │               │
         │              └─────────────────┘               │
         │                                                │
         ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│   FastMCP       │                              │    pgAdmin      │
│   Server        │──────────────────────────────│   Web UI        │
│   (Port 3001)   │                              │   (Port 5050)   │
└─────────────────┘                              └─────────────────┘
```

### Services Overview

- **api**: FastAPI resume processing service (Port 8000)
- **celery**: Background task worker for PDF processing
- **flower**: Celery monitoring dashboard (Port 5555)
- **fastmcp-server**: Additional MCP (Model Context Protocol) server (Port 3001)
- **db**: PostgreSQL with pgvector extension (Port 5432)
- **pgadmin**: Database administration interface (Port 5050)
- **redis**: Message broker and cache (Port 6379)

## 🛠️ Technology Stack

- **Backend Framework**: FastAPI
- **Task Queue**: Celery + Redis
- **Database**: PostgreSQL with pgvector extension
- **Document Processing**: LangChain + PyPDF
- **Embeddings**: Google Generative AI
- **Containerization**: Docker
- **Python Version**: 3.11+

## 📦 Installation

### Prerequisites

- Python 3.11+
- PostgreSQL with pgvector extension
- Redis server
- Google API key for embeddings

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fastapi-server
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Environment Variables**
   
   Create a `.env` file with the following variables:
   ```bash
   # Database Configuration
   PG_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/resumedb
   
   # Redis/Celery Configuration
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/1
   
   # Google AI Configuration
   GOOGLE_API_KEY=your_google_api_key_here
   EMBEDDING_MODEL=models/embedding-001
   
   # File Upload Configuration
   UPLOAD_DIR=/tmp/resume_uploads
   ```

### Docker Deployment

The project includes a complete Docker Compose setup with all required services:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment
   ```

2. **Set up environment files**
   ```bash
   # For FastAPI server
   cp fastapi-server/.env.example fastapi-server/.env
   # Edit fastapi-server/.env with your configuration
   
   # For FastMCP server (if applicable)
   cp fastmcp-server/.env.example fastmcp-server/.env
   # Edit fastmcp-server/.env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Check service status**
   ```bash
   docker-compose ps
   ```

### Available Services After Docker Compose Up

- **Resume API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Flower (Celery Monitoring)**: http://localhost:5555
- **pgAdmin (Database UI)**: http://localhost:5050
- **FastMCP Server**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🚀 Usage

### Quick Start with Docker Compose

The easiest way to run the entire system:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Management

```bash
# Start specific services
docker-compose up -d db redis  # Start dependencies first
docker-compose up -d api celery flower  # Start application services

# Scale workers
docker-compose up -d --scale celery=3  # Run 3 Celery workers

# Rebuild and restart a service
docker-compose up -d --build api
```

### Starting the Services (Local Development)

1. **Start the FastAPI server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start the Celery worker**
   ```bash
   celery -A app.worker worker --loglevel=info
   ```

3. **Optional: Start Flower for monitoring**
   ```bash
   celery -A app.worker flower
   ```

### API Endpoints

#### Upload Resumes
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
- files: List of PDF files (UploadFile[])

Response:
{
    "doc_id": "uuid-string",
    "status": "queued",
    "file_paths": ["path1", "path2"]
}
```

#### Example using curl
```bash
curl -X POST "http://localhost:8000/upload" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "files=@resume1.pdf" \
     -F "files=@resume2.pdf"
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📁 Project Structure

```
assignment/                          # Root project directory
├── docker-compose.yaml             # Complete multi-service orchestration
├── fastapi-server/                 # Resume processing API
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # 🚀 FastAPI app entry point (updated)
│   │   ├── worker.py               # ⚙️  Celery worker & tasks
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py         # ⚙️  Existing Configuration & env vars
│   │   │   └── agent_config.py     # ✨ New: Agent-specific configuration
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── models.py           # 📊 Data models
│   │   │   └── service.py          # 🔄 PDF processing logic
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── request.py          # 📝 API request/response schemas
│   │   │   └── chat.py             # ✨ New: Chat-related schemas
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── upload.py           # ✨ New: Move upload logic here
│   │   │   └── chat.py             # ✨ New: Chat endpoints
│   │   ├── utils/
│   │   │   ├── helpers.py          # 🛠️  File upload utilities
│   │   │   └── agent_utils.py      # ✨ New: Agent utilities
│   │   └── agents/
│   │       ├── __init__.py
│   │       └── mcp_agent.py        # ✨ New: MCP agent logic
│   ├── Dockerfile                  # Container configuration
│   ├── requirements.txt            # Python dependencies
│   ├── pyproject.toml              # Project metadata and dependencies
│   ├── uv.lock                     # UV lock file
│   ├── .env.example                # Environment variables template
│   └── README.md                   # Project documentation
└── fastmcp-server/                 # Model Context Protocol server
    ├── Dockerfile
    ├── .env.example
    └── [Additional MCP server files]
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PG_CONNECTION_STRING` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/resumedb` |
| `CELERY_BROKER_URL` | Redis broker URL for Celery | `redis://redis:6379/0` |
| `CELERY_RESULT_BACKEND` | Redis backend URL for Celery | `redis://redis:6379/0` |
| `GOOGLE_API_KEY` | Google AI API key for embeddings | Required |
| `EMBEDDING_MODEL` | Google embedding model name | `models/embedding-001` |
| `UPLOAD_DIR` | Directory for temporary file storage | `/tmp/resume_uploads` |

### Database Setup

The PostgreSQL database with pgvector extension is automatically configured via Docker Compose. If running locally, ensure PostgreSQL has the pgvector extension installed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Accessing Services

#### pgAdmin Database Management
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

To connect to the database from pgAdmin:
- **Host**: db (or localhost if running locally)
- **Port**: 5432
- **Database**: resumedb
- **Username**: postgres
- **Password**: postgres

#### Flower Celery Monitoring
- **URL**: http://localhost:5555
- Monitor task execution, worker status, and queue information

## 🔍 How It Works

1. **Upload**: Users upload PDF resume files via the `/upload` endpoint
2. **Storage**: Files are temporarily stored locally with unique identifiers
3. **Queue**: A Celery task is queued for background processing
4. **Processing**: The worker:
   - Loads PDF documents using PyPDFLoader
   - Splits text into chunks (1000 characters with 200 overlap)
   - Generates embeddings using Google Generative AI
   - Stores embeddings in PostgreSQL with pgvector
5. **Response**: Returns a document ID for tracking and future queries

## 🧪 Development

### Running Tests
```bash
# Run tests (when available)
pytest
```

### Code Style
```bash
# Format code
black app/
isort app/

# Lint code
flake8 app/
```

## 📈 Monitoring

### Flower Dashboard
Monitor Celery tasks and workers:
```bash
# Access via Docker Compose
docker-compose up -d flower
```
Visit `http://localhost:5555` for the Flower dashboard.

### Service Health Checks
The Docker Compose setup includes health checks for critical services:
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command

Check service health:
```bash
docker-compose ps
docker-compose logs <service-name>
```

### Container Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f celery
docker-compose logs -f db
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Service Dependencies**: Ensure databases are ready before starting application services
   ```bash
   docker-compose up -d db redis  # Start dependencies first
   docker-compose up -d api celery  # Then start application services
   ```

2. **Volume Permissions**: If facing permission issues with uploads:
   ```bash
   docker-compose down
   docker volume rm assignment_uploads_data
   docker-compose up -d
   ```

3. **Environment Variables**: Verify all required environment variables are set:
   ```bash
   # Check FastAPI server environment
   cat fastapi-server/.env
   
   # Check FastMCP server environment  
   cat fastmcp-server/.env
   ```

4. **Database Connection**: Test database connectivity:
   ```bash
   docker-compose exec db psql -U postgres -d resumedb -c "SELECT 1;"
   ```

5. **Redis Connection**: Test Redis connectivity:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

### Service-Specific Troubleshooting

#### FastAPI Server Issues
- Check logs: `docker-compose logs -f api`
- Verify upload directory permissions
- Ensure Google API key is valid

#### Celery Worker Issues  
- Check logs: `docker-compose logs -f celery`
- Verify Redis connection
- Check task queue status in Flower

#### Database Issues
- Check logs: `docker-compose logs -f db`
- Verify pgvector extension: `docker-compose exec db psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"`
- Access via pgAdmin at http://localhost:5050

### Logs and Debugging

- **FastAPI logs**: `docker-compose logs -f api`
- **Celery logs**: `docker-compose logs -f celery`
- **Database logs**: `docker-compose logs -f db`
- **Flower monitoring**: Available at `http://localhost:5555`
- **pgAdmin**: Available at `http://localhost:5050`

## 🔮 Future Enhancements

- [ ] Add chat/query endpoints for semantic search
- [ ] Implement user authentication
- [ ] Add support for other document formats
- [ ] Implement document similarity scoring
- [ ] Add monitoring and alerting
- [ ] Support for custom embedding models
- [ ] Implement document metadata extraction