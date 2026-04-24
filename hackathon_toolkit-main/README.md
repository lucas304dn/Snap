# bunq Hackathon Toolkit

Get started with the bunq banking API in under 5 minutes.

Working Python examples that cover authentication, payments, accounts, and more — all using the sandbox (no real money). Built for hackathon participants who want to learn fast and build something cool.

## Prerequisites

- **Python 3.10+** installed
- That's it. The first script creates a sandbox API key for you automatically.

## Quick Start

```bash
pip install -r requirements.txt
python 01_authentication.py
```

This will:
1. Create a sandbox user and API key
2. Walk you through the full authentication flow
3. Print your session token and user ID

Then try the other tutorials in order:

```bash
python 02_create_monetary_account.py
python 03_make_payment.py
python 04_request_money.py
python 05_create_bunqme_link.py
python 06_list_transactions.py
python 07_setup_callbacks.py
```

## Using Your Own API Key

If you already have a bunq sandbox API key, set it as an environment variable:

```bash
export BUNQ_API_KEY="your_sandbox_api_key_here"
```

Or create a `.env` file in the project root (see `.env.example`).

## Getting Test Money

In the sandbox, request up to EUR 500 from `sugardaddy@bunq.com`. Script `03_make_payment.py` does this automatically before sending a payment.

## Tutorials

| # | Script | What You'll Learn |
|---|--------|-------------------|
| 01 | `01_authentication.py` | The full auth flow: RSA keypair → installation → device → session |
| 02 | `02_create_monetary_account.py` | Create and list bank accounts |
| 03 | `03_make_payment.py` | Request test money and send a payment |
| 04 | `04_request_money.py` | Create payment requests (RequestInquiry) |
| 05 | `05_create_bunqme_link.py` | Generate shareable payment links |
| 06 | `06_list_transactions.py` | Retrieve payment history with pagination |
| 07 | `07_setup_callbacks.py` | Set up real-time payment notifications (webhooks) |

## How It Works

The `bunq_client.py` library handles the three-step authentication flow:

```
Your API Key
     │
     ▼
POST /installation ──→ Register your RSA public key
     │                  Get installation token + server public key
     ▼
POST /device-server ──→ Register your device
     │                   Uses installation token
     ▼
POST /session-server ──→ Create a session
     │                    Get session token + user ID
     ▼
  Ready to make API calls!
```

After the first authentication, your session is cached in `bunq_context.json` so you don't need to re-authenticate every time.

## API Rate Limits

| Method | Limit |
|--------|-------|
| GET | 3 requests per 3 seconds |
| POST | 5 requests per 3 seconds |
| PUT | 2 requests per 3 seconds |
| /session-server | 1 request per 30 seconds |

## Project Structure

```
hackathon-toolkit/
├── README.md                        ← you are here
├── .env.example
├── requirements.txt
├── bunq_client.py                   ← shared client library (auth + HTTP + signing)
├── 01_authentication.py
├── 02_create_monetary_account.py
├── 03_make_payment.py
├── 04_request_money.py
├── 05_create_bunqme_link.py
├── 06_list_transactions.py
├── 07_setup_callbacks.py
└── docs/
    ├── API_REFERENCE.md
    └── TROUBLESHOOTING.md
```

## Resources

- [bunq API Documentation](https://doc.bunq.com)
- [bunq Developer Portal](https://developer.bunq.com)
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md) — Endpoint cheat sheet
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — Common errors and fixes
