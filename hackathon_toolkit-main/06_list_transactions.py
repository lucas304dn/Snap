"""
Tutorial 06 — List Transactions

Retrieves payment history for your account, showing how pagination works.

The bunq API returns results in pages (default 10, max 200).
Each response includes pagination URLs for navigating older/newer records.

Endpoints used:
  GET /v1/user/{userId}/monetary-account/{accountId}/payment
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

    # ---- List recent transactions ----
    # Use ?count=20 to get up to 20 results (default is 10, max is 200)
    print("Recent transactions:")
    print("-" * 80)
    print(f"  {'Date':<22} {'Amount':>10}  {'Counterparty':<25} {'Description'}")
    print("-" * 80)

    payments = client.get(
        f"user/{client.user_id}/monetary-account/{account_id}/payment",
        params={"count": 20},
    )

    if not payments:
        print("  (no transactions yet — run 03_make_payment.py first)")
        return

    for item in payments:
        p = item.get("Payment", {})
        date = p.get("created", "")[:19]
        amount = p.get("amount", {})
        amount_str = f"{amount.get('value', '?')} {amount.get('currency', '')}"
        counterparty = p.get("counterparty_alias", {}).get("display_name", "?")
        description = p.get("description", "")
        print(f"  {date:<22} {amount_str:>10}  {counterparty:<25} {description}")

    print(f"\n  Showing {len(payments)} transaction(s)")
    print("  Tip: use ?count=200 for more results, or follow pagination URLs for full history")


if __name__ == "__main__":
    main()
