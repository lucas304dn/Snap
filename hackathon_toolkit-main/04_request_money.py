"""
Tutorial 04 — Request Money

Creates a payment request (RequestInquiry) and lists all your requests.

A RequestInquiry asks someone to pay you. In the sandbox, you can
request money from sugardaddy@bunq.com and it will be auto-accepted.

Endpoints used:
  POST /v1/user/{userId}/monetary-account/{accountId}/request-inquiry
  GET  /v1/user/{userId}/monetary-account/{accountId}/request-inquiry
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

    # ---- Create a payment request ----
    print("Creating a payment request for EUR 25.00...")
    resp = client.post(f"user/{client.user_id}/monetary-account/{account_id}/request-inquiry", {
        "amount_inquired": {"value": "25.00", "currency": "EUR"},
        "counterparty_alias": {
            "type": "EMAIL",
            "value": "sugardaddy@bunq.com",
            "name": "Sugar Daddy",
        },
        "description": "Hackathon expense split",
        "allow_bunqme": False,
    })
    request_id = resp[0]["Id"]["id"]
    print(f"  Request created! id: {request_id}\n")

    # ---- List all payment requests ----
    print("Your payment requests:")
    print("-" * 70)
    requests_list = client.get(
        f"user/{client.user_id}/monetary-account/{account_id}/request-inquiry"
    )
    for item in requests_list:
        req = item.get("RequestInquiry", {})
        print(
            f"  id={req.get('id')}  "
            f"status={req.get('status')}  "
            f"amount={req.get('amount_inquired', {}).get('value')} "
            f"{req.get('amount_inquired', {}).get('currency')}  "
            f"description={req.get('description')!r}"
        )


if __name__ == "__main__":
    main()
