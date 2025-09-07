from pydantic import BaseModel
from typing import List
from fastapi import UploadFile

class UploadRequest(BaseModel):
    files: List[UploadFile]
