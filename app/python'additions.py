# ─────────────────────────────────────────────────────────────────────────────
# DROP-IN ADDITIONS for your existing backend/routes/ai.py
#
# Two new endpoints the React frontend calls:
#   GET /api/guess-hint/{transaction_id}   → Claude-generated price hint
#   GET /api/leaderboard                   → weekly Price Guess Champions
#
# 1) Add the new function below to backend/services/claude.py
# 2) Paste the two endpoints below into backend/routes/ai.py
#    (anywhere alongside the other routes — they use `router`, `get_supabase`,
#     and the new `generate_price_hint` import)
# ─────────────────────────────────────────────────────────────────────────────


# ──────────── 1) Add to backend/services/claude.py ───────────────────────────

def generate_price_hint(merchant: str, amount: float, currency: str,
                        location_name: str, caption: str | None = None) -> str:
    """
    Generate a clever, contextual price hint for the Guess-the-Price game.
    The hint must NOT reveal the exact price, but should nudge the guesser.
    Crucially, it grounds itself in the MERCHANT and PRICE BAND so the hint
    actually makes sense (not a Lambo joke for an ice cream).
    """
    band = _price_band(amount)
    msg = get_client().messages.create(
        model="claude-sonnet-4-5",
        max_tokens=80,
        messages=[{"role": "user", "content": (
            f"You're playing a price-guessing game. A friend bought something at "
            f"'{merchant}' in {location_name} for {currency}{amount:.2f}. "
            f"{f'Their photo caption was: \"{caption}\". ' if caption else ''}"
            f"This price is {band} for that kind of item.\n\n"
            f"Write ONE short, witty hint (max 12 words) that:\n"
            f"- Is grounded in WHAT THEY BOUGHT (not random luxury references)\n"
            f"- Hints at whether the price is cheap, normal, or expensive for the item\n"
            f"- Does NOT say the actual number\n"
            f"- No quotes, no hashtags, no preamble\n\n"
            f"Examples:\n"
            f"- €12 ice cream → 'This price will give you brainfreeze 🥶'\n"
            f"- €3 espresso → 'Liquid productivity, fairly priced ☕'\n"
            f"- €40 pizza → 'Someone ordered the deluxe with extra regret 🍕'\n"
        )}]
    )
    return msg.content[0].text.strip().strip('"').strip("'")


def _price_band(amount: float) -> str:
    """Rough heuristic — Claude uses this to know if it's a deal or a ripoff."""
    if amount < 5:    return "very cheap"
    if amount < 15:   return "normal"
    if amount < 40:   return "a bit pricey"
    if amount < 100:  return "expensive"
    return "very expensive"


# ──────────── 2) Add to backend/routes/ai.py ────────────────────────────────
# (Make sure the imports at the top of routes/ai.py include:
#    from services.claude import (
#        generate_weekly_wrap, generate_place_memory,
#        generate_friend_reaction, generate_price_hint
#    )
# )

@router.get("/api/guess-hint/{transaction_id}")
async def get_price_hint(transaction_id: str):
    """Generate (or fetch cached) Claude price hint for a snap."""
    supabase = get_supabase()

    tx_result = supabase.table("transactions") \
        .select("amount, currency, merchant, location_name, caption") \
        .eq("id", transaction_id) \
        .single() \
        .execute()

    if not tx_result.data:
        raise HTTPException(404, "Transaction not found")

    tx = tx_result.data
    try:
        hint = generate_price_hint(
            merchant=tx.get("merchant", "Unknown"),
            amount=float(tx.get("amount") or 0),
            currency=tx.get("currency", "€"),
            location_name=tx.get("location_name", "Unknown"),
            caption=tx.get("caption")
        )
    except Exception as e:
        # Fail soft — frontend has its own local fallback hints
        hint = "Pricier than a coffee, cheaper than rent ☕"
        print(f"[guess-hint] claude fallback: {e}")

    return {"transaction_id": transaction_id, "hint": hint}


@router.get("/api/leaderboard")
async def get_leaderboard():
    """
    Weekly Price Guess Champions ranking.
    Computes |guess - actual| per reaction in the last 7 days,
    awards points (closer = more), and ranks users.
    """
    from datetime import datetime, timedelta, timezone
    from collections import defaultdict

    supabase = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    # Pull all guesses joined with the actual transaction amount
    reactions = supabase.table("reactions") \
        .select("user_id, price_guess, transaction_id, created_at, "
                "transactions(amount), profiles(username, display_name)") \
        .gte("created_at", since) \
        .not_.is_("price_guess", "null") \
        .execute().data or []

    scores = defaultdict(lambda: {
        "score": 0, "guesses": 0, "total_diff_pct": 0.0,
        "username": "?", "display_name": "?"
    })

    for r in reactions:
        guess = float(r.get("price_guess") or 0)
        actual = float((r.get("transactions") or {}).get("amount") or 0)
        if actual <= 0 or guess <= 0:
            continue

        diff_pct = abs(actual - guess) / actual
        # Points: 100 max for spot-on, decays exponentially
        points = max(0, int(100 * max(0, 1 - diff_pct * 2)))

        uid = r["user_id"]
        s = scores[uid]
        s["score"] += points
        s["guesses"] += 1
        s["total_diff_pct"] += diff_pct
        prof = r.get("profiles") or {}
        s["username"] = prof.get("username") or s["username"]
        s["display_name"] = prof.get("display_name") or s["display_name"]

    leaderboard = []
    for i, (uid, s) in enumerate(
        sorted(scores.items(), key=lambda kv: -kv[1]["score"]), start=1
    ):
        avg_diff = s["total_diff_pct"] / max(1, s["guesses"])
        leaderboard.append({
            "rank": i,
            "user_id": uid,
            "username": s["username"],
            "display_name": s["display_name"],
            "score": s["score"],
            "guesses": s["guesses"],
            "accuracy": f"{int((1 - avg_diff) * 100)}%"
        })

    return {"leaderboard": leaderboard, "since": since}