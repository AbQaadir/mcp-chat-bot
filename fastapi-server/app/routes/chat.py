from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest
from app.agents.mcp_agent import get_agent, init_agent
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("")
async def chat_stream(request: ChatRequest):
    current_agent = get_agent()
    if not current_agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    async def generate_json_stream():
        async for chunk in current_agent.astream(
            {"messages": [{"role": "user", "content": request.message}]},
            stream_mode="values"
        ):
            if "messages" in chunk:
                yield json.dumps({"chunk": chunk["messages"][-1].content}) + "\n"
    
    return StreamingResponse(generate_json_stream(), media_type="application/x-ndjson")