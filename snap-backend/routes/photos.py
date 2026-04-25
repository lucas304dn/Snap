import base64
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.supabase_client import get_supabase
from services.geocode import reverse_geocode
from services.claude import generate_caption

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/api/photos/upload")
async def upload_photo(
    transaction_id: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    file: UploadFile = File(...),
):
    supabase = get_supabase()

    tx = (
        supabase.table("transactions")
        .select("*")
        .eq("id", transaction_id)
        .single()
        .execute()
        .data
    )
    if not tx:
        raise HTTPException(404, "Transaction not found")

    deadline = datetime.fromisoformat(
        tx["snap_deadline"].replace("Z", "+00:00")
    )
    if datetime.now(timezone.utc) > deadline:
        raise HTTPException(410, "Snap window has closed")

    if tx.get("photo_url"):
        raise HTTPException(409, "Photo already uploaded for this transaction")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "Unsupported file type")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 10 MB)")

    # Upload to Supabase Storage
    storage_path = f"{tx['user_id']}/{transaction_id}.jpg"
    try:
        supabase.storage.from_("snaps").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": "image/jpeg", "upsert": "true"},
        )
        public_url = supabase.storage.from_("snaps").get_public_url(storage_path)
    except Exception as e:
        raise HTTPException(500, f"Storage upload failed: {e}")

    # Reverse geocode + Claude vision caption (sequential is fine for hackathon)
    geo = await reverse_geocode(lat, lng)

    try:
        image_b64 = base64.standard_b64encode(file_bytes).decode("utf-8")
        caption = generate_caption(
            tx["merchant"],
            float(tx["amount"]),
            tx.get("currency", "€"),
            geo["city"],
            image_b64,
        )
    except Exception:
        caption = f"{tx['merchant']} in {geo['city']}"

    supabase.table("transactions").update({
        "photo_url": public_url,
        "lat": lat,
        "lng": lng,
        "location_name": geo["city"],
        "country_code": geo["country_code"],
        "caption": caption,
        "snapped_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", transaction_id).execute()

    return {
        "status": "ok",
        "photo_url": public_url,
        "caption": caption,
        "location_name": geo["city"],
    }


@router.patch("/api/photos/{transaction_id}/caption")
async def update_caption(transaction_id: str, caption: str = Form(...)):
    get_supabase().table("transactions").update(
        {"caption": caption}
    ).eq("id", transaction_id).execute()
    return {"status": "ok"}


@router.patch("/api/photos/{transaction_id}/visibility")
async def update_visibility(
    transaction_id: str,
    is_public: bool = Form(...),
    show_amount: bool = Form(False),
):
    get_supabase().table("transactions").update(
        {"is_public": is_public, "show_amount": show_amount}
    ).eq("id", transaction_id).execute()
    return {"status": "ok"}
