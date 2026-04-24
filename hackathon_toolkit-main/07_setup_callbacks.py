"""
Tutorial 07 — Setup Callbacks (Webhooks)

Registers a callback URL to receive real-time notifications when
payments or mutations happen on your account.

To test locally, use a tool like ngrok to expose a local endpoint:
  ngrok http 8080
Then use the ngrok HTTPS URL as your callback target.

Endpoints used:
  POST /v1/user/{userId}/notification-filter-url
  GET  /v1/user/{userId}/notification-filter-url
"""

import os

from dotenv import load_dotenv
from bunq_client import BunqClient

load_dotenv()

# Replace with your actual webhook URL (e.g. from ngrok)
CALLBACK_URL = os.getenv("BUNQ_CALLBACK_URL", "https://your-webhook-url.example.com/callback")


def main() -> None:
    api_key = os.getenv("BUNQ_API_KEY", "").strip()
    if not api_key:
        print("No BUNQ_API_KEY found — creating a sandbox user...")
        api_key = BunqClient.create_sandbox_user()
        print(f"  API key: {api_key}\n")

    client = BunqClient(api_key=api_key, sandbox=True)
    client.authenticate()
    print(f"Authenticated — user {client.user_id}\n")

    # ---- Register callback filters ----
    print(f"Registering callback URL: {CALLBACK_URL}")
    print("  Categories: PAYMENT, MUTATION\n")

    client.post(f"user/{client.user_id}/notification-filter-url", {
        "notification_filters": [
            {"category": "PAYMENT", "notification_target": CALLBACK_URL},
            {"category": "MUTATION", "notification_target": CALLBACK_URL},
        ],
    })
    print("  Callbacks registered!\n")

    # ---- List active callback filters ----
    print("Active notification filters:")
    print("-" * 70)
    filters = client.get(f"user/{client.user_id}/notification-filter-url")
    for item in filters:
        nf = item.get("NotificationFilterUrl", {})
        for f in nf.get("notification_filters", []):
            print(
                f"  category={f.get('category')}  "
                f"target={f.get('notification_target')}"
            )

    if not filters:
        print("  (no filters found)")

    print("\nWhen a payment or mutation occurs, bunq will POST a JSON")
    print("notification to your callback URL. See doc.bunq.com for the payload format.")


if __name__ == "__main__":
    main()
