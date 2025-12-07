# app/schemas/media_schema.py
from pydantic import BaseModel

class ImageUploadResponse(BaseModel):
    file_url: str
    message: str = "Profile image uploaded successfully"


class CertificationUploadResponse(BaseModel):
    file_url: str
    certification_id: int
    message: str = "Certification uploaded successfully"
