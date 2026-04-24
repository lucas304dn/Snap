"""
Tutorial 03 — Make a Payment

Requests test money from Sugar Daddy, then sends a payment.

In the sandbox, you can request up to EUR 500 from sugardaddy@bunq.com
to fund your account before making payments.

Endpoints used:
  POST /v1/user/{userId}/monetary-account/{accountId}/request-inquiry
  POST /v1/user/{userId}/monetary-account/{accountId}/payment
"""

import os
import time

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

    # ---- Step 1: Request money from Sugar Daddy (sandbox only) ----
    print("Requesting EUR 500 from Sugar Daddy (sandbox test money)...")
    client.post(f"user/{client.user_id}/monetary-account/{account_id}/request-inquiry", {
        "amount_inquired": {"value": "500.00", "currency": "EUR"},
        "counterparty_alias": {
            "type": "EMAIL",
            "value": "sugardaddy@bunq.com",
            "name": "Sugar Daddy",
        },
        "description": "Hackathon test funds",
        "allow_bunqme": False,
    })
    print("  Request sent! Waiting a moment for funds to arrive...")
    time.sleep(2)

    # ---- Step 2: Make a payment ----
    print("\nSending EUR 10.00 payment...")
    resp = client.post(f"user/{client.user_id}/monetary-account/{account_id}/payment", {
        "amount": {"value": "10.00", "currency": "EUR"},
        "counterparty_alias": {
            "type": "EMAIL",
            "value": "sugardaddy@bunq.com",
            "name": "Sugar Daddy",
        },
        "description": "Hackathon test payment",
    })
    payment_id = resp[0]["Id"]["id"]
    print(f"  Payment sent! Payment id: {payment_id}")

    # ---- Step 3: Verify the payment ----
    print("\nVerifying payment details...")
    payment = client.get(
        f"user/{client.user_id}/monetary-account/{account_id}/payment/{payment_id}"
    )
    p = payment[0]["Payment"]
    print(f"  Amount: {p['amount']['value']} {p['amount']['currency']}")
    print(f"  To: {p['counterparty_alias']['display_name']}")
    print(f"  Description: {p['description']}")
    print(f"  Type: {p.get('type', 'N/A')}")


if __name__ == "__main__":
    main()
