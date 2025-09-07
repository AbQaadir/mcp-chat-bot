from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    stream: bool = True

class ChatResponse(BaseModel):
    content: str
    type: str
