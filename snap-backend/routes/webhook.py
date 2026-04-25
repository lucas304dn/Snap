import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Request
from services.supabase_client import get_supabase

router = APIRouter()


@router.post("/webhook/bunq")
async def bunq_webhook(request: Request):
    # ACK immediately — bunq retries if response is slow
    body = await request.json()
    try:
        notification = body.get("NotificationUrl", {})
        category = notification.get("category", "")

        if category not in ("PAYMENT", "MUTATION"):
            return {"status": "ignored"}

        payment_data = (
            notification.get("object", {}).get("Payment")
            or notification.get("object", {}).get("MasterCardAction")
            or {}
        )
        if not payment_data:
            return {"status": "ignored", "reason": "no payment object"}

        amount_obj = payment_data.get("amount", {})
        counterparty = payment_data.get("counterparty_alias", {})
        snap_deadline = (
            datetime.now(timezone.utc) + timedelta(minutes=5)
        ).isoformat()

        supabase = get_supabase()
        result = supabase.table("transactions").upsert(
            {
                "bunq_payment_id": str(payment_data.get("id", "")),
                "amount": float(amount_obj.get("value", 0)),
                "currency": amount_obj.get("currency", "EUR"),
                "merchant": (
                    counterparty.get("display_name")
                    or payment_data.get("description", "Unknown")
                ),
                "snap_deadline": snap_deadline,
                "user_id": os.getenv("DEMO_USER_ID"),
            },
            on_conflict="bunq_payment_id",
        ).execute()

        return {
            "status": "ok",
            "transaction_id": result.data[0]["id"] if result.data else None,
        }
    except Exception as e:
        print(f"[webhook error] {e}")
        return {"status": "error", "detail": str(e)}


@router.post("/webhook/bunq/test")
async def test_webhook(request: Request):
    """Fire a fake payment for local dev — no bunq needed."""
    body = await request.json()
    snap_deadline = (
        datetime.now(timezone.utc) + timedelta(minutes=5)
    ).isoformat()

    supabase = get_supabase()
    result = supabase.table("transactions").insert({
        "bunq_payment_id": f"test-{datetime.now().timestamp()}",
        "amount": float(body.get("amount", 9.99)),
        "currency": body.get("currency", "EUR"),
        "merchant": body.get("merchant", "Test Merchant"),
        "snap_deadline": snap_deadline,
        "user_id": os.getenv("DEMO_USER_ID"),
    }).execute()

    return {
        "status": "ok",
        "transaction": result.data[0] if result.data else None,
    }
