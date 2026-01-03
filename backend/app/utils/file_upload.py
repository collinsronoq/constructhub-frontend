import os
from fastapi import UploadFile, HTTPException
from datetime import datetime
import uuid
from app.core.config import settings

MEDIA_BASE_URL = settings.MEDIA_BASE_URL.rstrip("/")

CERT_UPLOAD_ROOT = os.path.join("app", "static", "uploads", "technicians", "certifications")

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



#Technician Certification Upload

async def save_certification_file(technician_id: int, file: UploadFile) -> str:
    validate_extension(file.filename)

    dir_path = os.path.join(CERT_UPLOAD_ROOT, str(technician_id))
    os.makedirs(dir_path, exist_ok=True)

    extension = file.filename.split(".")[-1].lower()
    unique_name = f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}.{extension}"

    full_path = os.path.join(dir_path, unique_name)

    with open(full_path, "wb") as buffer:
        buffer.write(await file.read())

    rel = f"/uploads/technicians/certifications/{technician_id}/{unique_name}"
    return f"{MEDIA_BASE_URL}{rel}"



# Technician Profile Image Upload

BASE_IMAGE_DIR = os.path.join("app", "static", "uploads", "technicians", "profile_images")


async def save_technician_profile_image(tech_id: int, file: UploadFile) -> str:
    ext = validate_extension(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported image type '{ext}'.")

    contents = await file.read()
    size = len(contents)
    if size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    if size > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    folder = os.path.join(BASE_IMAGE_DIR, str(tech_id))
    os.makedirs(folder, exist_ok=True)

    filename = f"tech_{tech_id}_{uuid.uuid4().hex}.{ext}"
    full_path = os.path.join(folder, filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    rel = f"/uploads/technicians/profile_images/{tech_id}/{filename}"
    return f"{MEDIA_BASE_URL}{rel}"



# Vendor Banner + Logo Support


VENDOR_BASE_DIR = os.path.join("app", "static", "uploads", "vendors")
os.makedirs(VENDOR_BASE_DIR, exist_ok=True)


async def save_vendor_banner(vendor_id: int, file: UploadFile) -> str:
    ext = validate_extension(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only image files allowed.")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    folder = os.path.join(VENDOR_BASE_DIR, str(vendor_id), "banner")
    os.makedirs(folder, exist_ok=True)

    filename = f"banner_{uuid.uuid4().hex}.{ext}"
    full_path = os.path.join(folder, filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    rel = f"/uploads/vendors/{vendor_id}/banner/{filename}"
    return f"{MEDIA_BASE_URL}{rel}"


async def save_vendor_logo(vendor_id: int, file: UploadFile) -> str:
    ext = validate_extension(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only image files allowed.")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    folder = os.path.join(VENDOR_BASE_DIR, str(vendor_id), "logo")
    os.makedirs(folder, exist_ok=True)

    filename = f"logo_{uuid.uuid4().hex}.{ext}"
    full_path = os.path.join(folder, filename)

    with open(full_path, "wb") as f:
        f.write(contents)

    rel = f"/uploads/vendors/{vendor_id}/logo/{filename}"
    return f"{MEDIA_BASE_URL}{rel}"



# vendor item or material
# Directory for vendor item images
BASE_VENDOR_ITEMS_DIR = os.path.join("app", "static", "uploads", "vendors", "items")
os.makedirs(BASE_VENDOR_ITEMS_DIR, exist_ok=True)

async def save_vendor_item_image(vendor_id: int, item_id: int, file: UploadFile) -> str:
    ext = validate_extension(file.filename)
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid image type")

    contents = await file.read()
    size = len(contents)

    if size == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if size > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="File too large")

    filename = f"vendor_{vendor_id}_item_{item_id}_{uuid.uuid4().hex}.{ext}"
    dir_path = os.path.join(BASE_VENDOR_ITEMS_DIR, str(vendor_id), str(item_id))
    full_path = os.path.join(dir_path, filename)

    os.makedirs(dir_path, exist_ok=True)

    with open(full_path, "wb") as f:
        f.write(contents)

    rel = f"/uploads/vendors/items/{vendor_id}/{item_id}/{filename}"
    return f"{MEDIA_BASE_URL}{rel}"
