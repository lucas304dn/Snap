"""
List all monetary accounts for your bunq user.

Shows account ID, status, description, balance, and IBAN for each account.

Endpoint used:
  GET /v1/user/{userId}/monetary-account
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

    print("Monetary accounts:")
    print("-" * 80)

    accounts = client.get(f"user/{client.user_id}/monetary-account")

    if not accounts:
        print("  (no accounts found)")
        return

    for item in accounts:
        account_type = next(iter(item))
        acc = item[account_type]
        ibans = [a["value"] for a in acc.get("alias", []) if a.get("type") == "IBAN"]
        balance = acc.get("balance", {})
        print(
            f"  [{account_type}]\n"
            f"    id:          {acc.get('id')}\n"
            f"    status:      {acc.get('status')}\n"
            f"    description: {acc.get('description')}\n"
            f"    balance:     {balance.get('value', '?')} {balance.get('currency', '')}\n"
            f"    IBAN:        {', '.join(ibans) if ibans else '(none)'}\n"
        )

    print(f"Total: {len(accounts)} account(s)")


if __name__ == "__main__":
    main()
