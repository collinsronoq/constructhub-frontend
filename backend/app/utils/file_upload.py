import os
from fastapi import UploadFile, HTTPException
from datetime import datetime
import uuid

UPLOAD_ROOT = "app/uploads/certifications"


ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {"pdf"}

ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS.union(ALLOWED_DOCUMENT_EXTENSIONS)


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
    return f"/static/certifications/{technician_id}/{unique_name}"


async def save_image_file(
    entity_type: str,     # "technicians", "vendors", "materials"
    entity_id: int,
    file: UploadFile
) -> str:

    ext = validate_extension(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only image files (jpg, jpeg, png, webp) are allowed"
        )

    dir_path = os.path.join("app/uploads/images", entity_type, str(entity_id))
    os.makedirs(dir_path, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}.{ext}"

    full_path = os.path.join(dir_path, unique_name)

    with open(full_path, "wb") as buffer:
        buffer.write(await file.read())

    # Return the static URL
    return f"/static/images/{entity_type}/{entity_id}/{unique_name}"
