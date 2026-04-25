from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_client import get_supabase
from services.claude import (
    generate_weekly_wrap,
    generate_place_memory,
    generate_friend_reaction,
)

router = APIRouter()


@router.get("/api/feed/{user_id}")
async def get_friend_feed(user_id: str):
    supabase = get_supabase()

    friend_rows = (
        supabase.table("friends")
        .select("friend_id")
        .eq("user_id", user_id)
        .eq("status", "accepted")
        .execute()
        .data
        or []
    )
    visible_ids = [f["friend_id"] for f in friend_rows] + [user_id]

    snaps = (
        supabase.table("transactions")
        .select(
            "id, user_id, amount, currency, merchant, photo_url, caption, "
            "lat, lng, location_name, country_code, show_amount, snapped_at, created_at"
        )
        .in_("user_id", visible_ids)
        .eq("is_public", True)
        .not_.is_("photo_url", "null")
        .order("snapped_at", desc=True)
        .limit(50)
        .execute()
        .data
        or []
    )

    for snap in snaps:
        if not snap.get("show_amount"):
            snap["amount"] = None

    return {"snaps": snaps}


@router.get("/api/map/{user_id}")
async def get_map_pins(user_id: str):
    supabase = get_supabase()

    friend_rows = (
        supabase.table("friends")
        .select("friend_id")
        .eq("user_id", user_id)
        .eq("status", "accepted")
        .execute()
        .data
        or []
    )
    visible_ids = [f["friend_id"] for f in friend_rows] + [user_id]

    pins = (
        supabase.table("transactions")
        .select(
            "id, user_id, merchant, photo_url, caption, lat, lng, "
            "location_name, country_code, amount, show_amount"
        )
        .in_("user_id", visible_ids)
        .eq("is_public", True)
        .not_.is_("lat", "null")
        .not_.is_("photo_url", "null")
        .execute()
        .data
        or []
    )

    for pin in pins:
        if not pin.get("show_amount"):
            pin["amount"] = None

    return {"pins": pins}


@router.get("/api/wrap/{user_id}")
async def get_weekly_wrap(user_id: str):
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    txns = (
        get_supabase()
        .table("transactions")
        .select(
            "amount, currency, merchant, location_name, country_code, caption, snapped_at"
        )
        .eq("user_id", user_id)
        .gte("snapped_at", since)
        .not_.is_("photo_url", "null")
        .order("snapped_at")
        .execute()
        .data
        or []
    )

    return {
        "snap_count": len(txns),
        "wrap": generate_weekly_wrap(txns),
        "transactions": txns,
    }


@router.get("/api/stats/{user_id}")
async def get_country_stats(user_id: str):
    txns = (
        get_supabase()
        .table("transactions")
        .select(
            "amount, currency, merchant, location_name, country_code, photo_url, snapped_at"
        )
        .eq("user_id", user_id)
        .not_.is_("photo_url", "null")
        .execute()
        .data
        or []
    )

    countries: dict = defaultdict(
        lambda: {"total": 0.0, "snap_count": 0, "snaps": [], "cities": defaultdict(float)}
    )

    for t in txns:
        cc = t.get("country_code") or "??"
        countries[cc]["total"] += float(t.get("amount") or 0)
        countries[cc]["snap_count"] += 1
        countries[cc]["snaps"].append(t)
        countries[cc]["cities"][t.get("location_name", "?")] += float(t.get("amount") or 0)

    result = []
    for cc, data in countries.items():
        result.append({
            "country_code": cc,
            "total_spent": round(data["total"], 2),
            "snap_count": data["snap_count"],
            "snaps": sorted(data["snaps"], key=lambda x: x.get("snapped_at") or "", reverse=True),
            "cities": [
                {"city": k, "total": round(v, 2)}
                for k, v in sorted(data["cities"].items(), key=lambda x: -x[1])
            ],
        })

    return {"countries": sorted(result, key=lambda x: -x["total_spent"])}


@router.get("/api/place-memory/{user_id}")
async def get_place_memory(user_id: str, location_name: str):
    visits = (
        get_supabase()
        .table("transactions")
        .select("amount, currency, merchant, caption, snapped_at")
        .eq("user_id", user_id)
        .eq("location_name", location_name)
        .not_.is_("photo_url", "null")
        .order("snapped_at")
        .execute()
        .data
        or []
    )

    return {
        "location": location_name,
        "visit_count": len(visits),
        "memory": generate_place_memory(location_name, visits),
    }


class GuessPayload(BaseModel):
    transaction_id: str
    guesser_user_id: str
    guess_amount: float


@router.post("/api/guess")
async def submit_price_guess(payload: GuessPayload):
    supabase = get_supabase()

    tx = (
        supabase.table("transactions")
        .select("amount, currency, merchant, show_amount")
        .eq("id", payload.transaction_id)
        .single()
        .execute()
        .data
    )
    if not tx:
        raise HTTPException(404, "Transaction not found")

    ai_reaction = generate_friend_reaction(
        tx["merchant"],
        float(tx["amount"]),
        tx.get("currency", "€"),
        payload.guess_amount,
    )

    supabase.table("reactions").insert({
        "transaction_id": payload.transaction_id,
        "user_id": payload.guesser_user_id,
        "price_guess": payload.guess_amount,
        "ai_reaction": ai_reaction,
    }).execute()

    response: dict = {"ai_reaction": ai_reaction}
    if tx.get("show_amount"):
        response["actual_amount"] = float(tx["amount"])
        diff = abs(float(tx["amount"]) - payload.guess_amount)
        response["correct"] = diff < 1.0

    return response


@router.get("/api/reactions/{transaction_id}")
async def get_reactions(transaction_id: str):
    reactions = (
        get_supabase()
        .table("reactions")
        .select("user_id, price_guess, ai_reaction, created_at")
        .eq("transaction_id", transaction_id)
        .order("created_at")
        .execute()
        .data
        or []
    )
    return {"reactions": reactions}
