from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import app as core_app
from app.routes.chat import router as chat_router
from app.routes.upload import router as upload_router
from app.agents.mcp_agent import init_agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_agent()
    except Exception as e:
        print(f"Failed to initialize agent during startup: {str(e)}")
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://next-frontend:3000",  # Docker container name
        "http://frontend:3000",  # Alternative container name
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(upload_router)
app.include_router(chat_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
