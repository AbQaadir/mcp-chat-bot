from langchain_mcp_adapters.client import MultiServerMCPClient
from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model
from app.config.settings import settings
from app.core import app
import json

mcp_client = None
agent = None

async def init_agent():
    global mcp_client, agent
    try:
        mcp_client = MultiServerMCPClient(settings.MCP_SERVER)
        mcp_tools = await mcp_client.get_tools()
        model = init_chat_model(settings.MODEL_NAME, model_provider=settings.MODEL_PROVIDER)

        collection_name = getattr(app.state, 'latest_doc_id', 'default_collection')
        agent = create_deep_agent(
            model=model,
            tools=mcp_tools,
            instructions=f"The collection_name for the resume-mcp is: {collection_name}"
        )
        print(f"Agent initialized with collection_name: {collection_name}")
    except Exception as e:
        print(f"Failed to initialize agent: {str(e)}")
        raise

def get_agent():
    return agent
