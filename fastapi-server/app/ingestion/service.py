from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_postgres.vectorstores import PGVector
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from app.config.settings import settings

class PDFIngestionService:
    def __init__(self):
        self.embeddings = self._initialize_embeddings()

    def _initialize_embeddings(self):
        return GoogleGenerativeAIEmbeddings(
            google_api_key=settings.GOOGLE_API_KEY, # type: ignore
            model=settings.EMBEDDING_MODEL,
            request_options={"output_dimensionality": 1536}
        )

    def _load_and_split_pdf(self, pdf_path: str):
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return text_splitter.split_documents(documents)

    def ingest_pdf_to_pgvector(self, pdf_paths: List[str], collection_name: str) -> str:
        try:
            docs = []
            for pdf_path in pdf_paths:
                docs.extend(self._load_and_split_pdf(pdf_path))
            vector_store = PGVector(
                embeddings=self.embeddings,
                collection_name=collection_name,
                connection=settings.PG_CONNECTION_STRING,
                use_jsonb=True,
            )
            vector_store.add_documents(docs)
            return f"Ingested {len(docs)} chunks from {len(pdf_paths)} PDFs"
        except Exception as e:
            return f"Ingestion failed: {str(e)}"
