import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

_client: anthropic.Anthropic | None = None

def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def generate_caption(
    merchant: str,
    amount: float,
    currency: str,
    location_name: str,
    image_base64: str,
) -> str:
    msg = get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=80,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_base64,
                    },
                },
                {
                    "type": "text",
                    "text": (
                        f"I just paid {currency}{amount:.2f} at '{merchant}' in {location_name}. "
                        "Look at the photo and write ONE short, funny, relatable caption. "
                        "Max 8 words. No hashtags. No quotes."
                    ),
                },
            ],
        }],
    )
    return msg.content[0].text.strip()


def generate_weekly_wrap(transactions: list[dict]) -> str:
    if not transactions:
        return "No snaps this week — get out there and spend something!"

    tx_summary = "\n".join([
        f"- {t.get('snapped_at', '')[:10]}: {t.get('currency', '€')}{t.get('amount', 0):.2f} "
        f"at {t.get('merchant', '?')} in {t.get('location_name', '?')} "
        f"(caption: \"{t.get('caption', '')}\")"
        for t in transactions
    ])

    msg = get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": (
                f"Here are my transactions and photos from this week:\n{tx_summary}\n\n"
                "Write a personal wrap-up in exactly 3 short paragraphs:\n"
                "1. Where I went and what I did\n"
                "2. My spending highlights\n"
                "3. One memorable moment\n\n"
                "End with exactly this format on its own line: PERSONALITY: [adjective] spender\n"
                "Sound like a fun friend, not a financial advisor. Under 150 words total."
            ),
        }],
    )
    return msg.content[0].text.strip()


def generate_place_memory(location_name: str, visits: list[dict]) -> str:
    if not visits:
        return f"No memories saved for {location_name} yet."

    visit_summary = "\n".join([
        f"- {v.get('snapped_at', '')[:10]}: {v.get('merchant', '?')} "
        f"({v.get('currency', '€')}{v.get('amount', 0):.2f}) — \"{v.get('caption', '')}\""
        for v in visits
    ])

    msg = get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=150,
        messages=[{
            "role": "user",
            "content": (
                f"Every time I've spent money in {location_name}:\n{visit_summary}\n\n"
                "Write exactly 2 warm, nostalgic sentences about what this place means to me "
                "based on my visits and what I bought. Sound personal and a little poetic."
            ),
        }],
    )
    return msg.content[0].text.strip()


def generate_friend_reaction(
    merchant: str, amount: float, currency: str, guess: float
) -> str:
    diff = abs(amount - guess)
    accuracy = "spot on" if diff < 1 else f"{currency}{diff:.2f} off"

    msg = get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=60,
        messages=[{
            "role": "user",
            "content": (
                f"My friend guessed {currency}{guess:.2f} for my purchase at {merchant} "
                f"which actually cost {currency}{amount:.2f} (they were {accuracy}). "
                "Write ONE witty 1-sentence reaction. Be playful, max 12 words."
            ),
        }],
    )
    return msg.content[0].text.strip()
