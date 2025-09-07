import os
from fastmcp import FastMCP
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_postgres.vectorstores import PGVector

load_dotenv()

mcp = FastMCP("resume-mcp")


@mcp.tool()
def search_resumes(query: str, collection_name: str, top_k: int = 5) -> list[str]:
    """
    Perform semantic search over resumes.
    - query: natural language search string
    - collection_name: which collection/tenant to search
    - top_k: number of results to return
    """

    # 1. Get query embedding from Gemini
    
    embeddings = GoogleGenerativeAIEmbeddings(
            google_api_key=os.environ.get("GOOGLE_API_KEY"), # type: ignore
            model=str(os.environ.get("EMBEDDING_MODEL")),  # type: ignore
            request_options={"output_dimensionality": 1536}
    )

    vector_store = PGVector(
        embeddings=embeddings,
        collection_name=collection_name,
        connection=os.environ.get("PG_CONNECTION_STRING"),
        use_jsonb=True,
    )

    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 2})

    results = retriever.get_relevant_documents(query)

    return [doc.page_content for doc in results]
        
    
if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8005)
