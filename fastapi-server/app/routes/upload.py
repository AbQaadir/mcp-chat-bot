# app/routes/upload.py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from app.core import app
from app.utils.helpers import save_upload_file
from app.worker import celery_app
from app.config.settings import settings
from app.agents.mcp_agent import init_agent
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("")
async def upload_resumes(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    doc_id = str(uuid.uuid4())
    file_paths = []
    for file in files:
        file_path, _ = save_upload_file(file, settings.UPLOAD_DIR)
        file_paths.append(file_path)
    celery_app.send_task("tasks.process_pdfs", args=[doc_id, file_paths])
    app.state.latest_doc_id = doc_id
    
    
    background_tasks.add_task(init_agent)
    return {
        "status": "queued",
        "file_paths": file_paths,
        "message": f"Successfully queued {len(files)} files for processing"
    }
