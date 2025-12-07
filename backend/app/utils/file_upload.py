import os
from fastapi import UploadFile, HTTPException
from datetime import datetime
import uuid

UPLOAD_ROOT = "app/uploads/certifications"


ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {"pdf"}

ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS.union(ALLOWED_DOCUMENT_EXTENSIONS)
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB

def validate_extension(filename: str):
    ext = filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    return ext


async def save_certification_file(technician_id: int, file: UploadFile) -> str:
    validate_extension(file.filename)

    # Directory path
    dir_path = os.path.join(UPLOAD_ROOT, str(technician_id))
    os.makedirs(dir_path, exist_ok=True)

    # Unique filename to avoid collisions
    extension = file.filename.split(".")[-1].lower()
    unique_name = f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}.{extension}"

    full_path = os.path.join(dir_path, unique_name)

    with open(full_path, "wb") as buffer:
        buffer.write(await file.read())

    # Return path as URL-style string
    return f"/static/uploads/technician/certifications/{technician_id}/{unique_name}"


# Base upload dir (matches Storage: A)
BASE_IMAGE_DIR = os.path.join("app", "static", "uploads", "technicians", "profile_images")

os.makedirs(BASE_IMAGE_DIR, exist_ok=True)


async def save_technician_profile_image(tech_id: int, file: UploadFile) -> str:
    """
    Validate and save uploaded technician profile image.
    Returns the public static URL (e.g. /static/uploads/technicians/profile_images/tech_23.png).
    """
    ext = validate_extension(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported image type '{ext}'. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}")

    contents = await file.read()
    size = len(contents)
    if size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    if size > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large. Max allowed is {MAX_IMAGE_BYTES // (1024*1024)} MB")

    # Deterministic filename as requested (Naming: A)
    filename = f"tech_{tech_id}.{ext}"
    dir_path = BASE_IMAGE_DIR
    os.makedirs(dir_path, exist_ok=True)

    full_path = os.path.join(dir_path, filename)
    # write binary file (sync write is OK for <=10MB; if you want non-blocking use aiofiles)
    with open(full_path, "wb") as f:
        f.write(contents)

    # Public static url (main.py will mount /static)
    return f"/static/uploads/technicians/profile_images/{filename}"