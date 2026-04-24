"""
Tutorial 05 — Create a bunq.me Payment Link

Creates a shareable payment link that anyone can use to pay you.
Supports iDEAL, Sofort, bancontact, and bunq payments.

Endpoints used:
  POST /v1/user/{userId}/monetary-account/{accountId}/bunqme-tab
  GET  /v1/user/{userId}/monetary-account/{accountId}/bunqme-tab
"""

import os

from dotenv import load_dotenv
from bunq_client import BunqClient

load_dotenv()


def main() -> None:
    api_key = os.getenv("BUNQ_API_KEY", "").strip()
    if not api_key:
        print("No BUNQ_API_KEY found — creating a sandbox user...")
        api_key = BunqClient.create_sandbox_user()
        print(f"  API key: {api_key}\n")

    client = BunqClient(api_key=api_key, sandbox=True)
    client.authenticate()
    account_id = client.get_primary_account_id()
    print(f"Authenticated — user {client.user_id}, account {account_id}\n")

    # ---- Create a bunq.me payment link ----
    print("Creating a bunq.me payment link for EUR 5.00...")
    resp = client.post(f"user/{client.user_id}/monetary-account/{account_id}/bunqme-tab", {
        "bunqme_tab_entry": {
            "amount_inquired": {"value": "5.00", "currency": "EUR"},
            "description": "Hackathon donation",
        },
    })
    tab_id = resp[0]["Id"]["id"]
    print(f"  Tab created! id: {tab_id}\n")

    # ---- Retrieve the shareable URL ----
    print("Fetching the shareable link...")
    tab_data = client.get(
        f"user/{client.user_id}/monetary-account/{account_id}/bunqme-tab/{tab_id}"
    )
    tab = tab_data[0]["BunqMeTab"]
    share_url = tab.get("bunqme_tab_share_url", "(no URL returned in sandbox)")
    print(f"  Share this link: {share_url}")
    print(f"  Status: {tab.get('status')}")

    # ---- List all bunq.me tabs ----
    print("\nAll your bunq.me tabs:")
    print("-" * 70)
    tabs = client.get(f"user/{client.user_id}/monetary-account/{account_id}/bunqme-tab")
    for item in tabs:
        t = item.get("BunqMeTab", {})
        entry = t.get("bunqme_tab_entry", {})
        amount = entry.get("amount_inquired", {})
        print(
            f"  id={t.get('id')}  "
            f"status={t.get('status')}  "
            f"amount={amount.get('value')} {amount.get('currency')}  "
            f"description={entry.get('description')!r}"
        )


if __name__ == "__main__":
    main()
