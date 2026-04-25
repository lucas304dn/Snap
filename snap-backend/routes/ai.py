import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from services.supabase_client import get_supabase
from services.claude import (
    generate_weekly_wrap,
    generate_place_memory,
    generate_friend_reaction,
    generate_guess_hint,
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
            "lat, lng, location_name, country_code, show_amount, snapped_at, created_at, "
            "profiles(username, display_name, avatar_url)"
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
            "amount, currency, merchant, location_name, country_code, caption, snapped_at, photo_url"
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

    actual = float(tx["amount"])
    diff = abs(actual - payload.guess_amount)
    return {
        "ai_reaction": ai_reaction,
        "actual_amount": actual,
        "correct": diff < 1.0,
    }


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


@router.post("/api/simulate")
async def simulate_payment(request: Request):
    """Alias for /webhook/bunq/test — used by the demo control panel."""
    body = await request.json()
    snap_deadline = (
        datetime.now(timezone.utc) + timedelta(minutes=5)
    ).isoformat()

    supabase = get_supabase()
    result = supabase.table("transactions").insert({
        "bunq_payment_id": f"sim-{datetime.now().timestamp()}",
        "amount": float(body.get("amount", 9.99)),
        "currency": body.get("currency", "EUR"),
        "merchant": body.get("merchant", "Test Merchant"),
        "snap_deadline": snap_deadline,
        "user_id": body.get("user_id") or os.getenv("DEMO_USER_ID"),
    }).execute()

    return {
        "status": "ok",
        "transaction": result.data[0] if result.data else None,
    }


@router.get("/api/country/{user_id}/{country_code}")
async def get_country_detail(user_id: str, country_code: str):
    txns = (
        get_supabase()
        .table("transactions")
        .select(
            "id, merchant, amount, currency, location_name, photo_url, caption, snapped_at"
        )
        .eq("user_id", user_id)
        .eq("country_code", country_code.upper())
        .not_.is_("photo_url", "null")
        .order("snapped_at", desc=True)
        .execute()
        .data
        or []
    )
    total = sum(float(t.get("amount") or 0) for t in txns)
    return {
        "country_code": country_code.upper(),
        "snap_count": len(txns),
        "total_spent": round(total, 2),
        "snaps": txns,
    }


@router.get("/api/country-memory/{user_id}/{country_code}")
async def get_country_memory(user_id: str, country_code: str):
    visits = (
        get_supabase()
        .table("transactions")
        .select("amount, currency, merchant, caption, snapped_at, location_name")
        .eq("user_id", user_id)
        .eq("country_code", country_code.upper())
        .not_.is_("photo_url", "null")
        .order("snapped_at")
        .execute()
        .data
        or []
    )
    return {
        "country_code": country_code.upper(),
        "visit_count": len(visits),
        "memory": generate_place_memory(country_code.upper(), visits),
    }


@router.get("/api/guess-hint/{transaction_id}")
async def get_guess_hint(transaction_id: str):
    tx = (
        get_supabase()
        .table("transactions")
        .select("merchant, amount, currency")
        .eq("id", transaction_id)
        .single()
        .execute()
        .data
    )
    if not tx:
        raise HTTPException(404, "Transaction not found")

    hint = generate_guess_hint(
        tx["merchant"],
        float(tx["amount"]),
        tx.get("currency", "EUR"),
    )
    return {"hint": hint}


@router.get("/api/leaderboard")
async def get_leaderboard():
    reactions = (
        get_supabase()
        .table("reactions")
        .select("user_id, price_guess, transaction_id, created_at, transactions(amount)")
        .not_.is_("price_guess", "null")
        .execute()
        .data
        or []
    )

    scores: dict = defaultdict(lambda: {"guesses": 0, "correct": 0})
    for r in reactions:
        uid = r["user_id"]
        scores[uid]["guesses"] += 1
        actual = (r.get("transactions") or {}).get("amount")
        if actual is not None and abs(float(actual) - float(r["price_guess"])) < 1.0:
            scores[uid]["correct"] += 1

    result = [
        {"user_id": uid, "guesses": v["guesses"], "correct": v["correct"]}
        for uid, v in scores.items()
    ]
    result.sort(key=lambda x: (-x["correct"], -x["guesses"]))
    return {"leaderboard": result[:20]}
