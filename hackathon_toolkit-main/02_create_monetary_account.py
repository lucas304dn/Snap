"""
Tutorial 02 — Create a Monetary Account

Creates a new EUR bank account and lists all your monetary accounts.

Endpoints used:
  POST /v1/user/{userId}/monetary-account-bank
  GET  /v1/user/{userId}/monetary-account-bank
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
    print(f"Authenticated as user {client.user_id}\n")

    # ---- Create a new monetary account ----
    print("Creating a new EUR monetary account...")
    resp = client.post(f"user/{client.user_id}/monetary-account-bank", {
        "currency": "EUR",
        "description": "Hackathon Account",
    })
    new_account_id = resp[0]["Id"]["id"]
    print(f"  Created account id: {new_account_id}\n")

    # ---- List all monetary accounts ----
    print("Your monetary accounts:")
    print("-" * 70)
    accounts = client.get(f"user/{client.user_id}/monetary-account-bank")
    for item in accounts:
        acc = item.get("MonetaryAccountBank", {})
        ibans = [a["value"] for a in acc.get("alias", []) if a.get("type") == "IBAN"]
        balance = acc.get("balance", {})
        print(
            f"  id={acc.get('id')}  "
            f"status={acc.get('status')}  "
            f"description={acc.get('description')!r}  "
            f"balance={balance.get('value', '?')} {balance.get('currency', '')}  "
            f"IBAN={ibans}"
        )


if __name__ == "__main__":
    main()
