from celery import Celery
from app.ingestion.service import PDFIngestionService
from app.config.settings import settings
from typing import List

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

@celery_app.task(name="tasks.process_pdfs")
def process_pdf_task(doc_id: str, file_paths: List[str]):
    ingestion_service = PDFIngestionService()
    return ingestion_service.ingest_pdf_to_pgvector(file_paths, doc_id)
