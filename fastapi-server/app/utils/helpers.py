import os
import tempfile
import uuid
from fastapi import UploadFile
from typing import Tuple

def save_upload_file(file: UploadFile, upload_dir: str) -> Tuple[str, str]:
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{doc_id}.pdf")
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    return file_path, doc_id
