# bunq API — Quick Reference

Base URLs:
- **Sandbox:** `https://public-api.sandbox.bunq.com/v1`
- **Production:** `https://api.bunq.com/v1`

## Endpoints Used in This Toolkit

| Method | Endpoint | Auth | Signing | Description |
|--------|----------|------|---------|-------------|
| POST | `/sandbox-user-person` | None | No | Create a sandbox test user |
| POST | `/installation` | None | No | Register your RSA public key |
| POST | `/device-server` | Installation token | Yes | Register your device |
| POST | `/session-server` | Installation token | Yes | Create a session (get session token) |
| GET | `/user/{uid}/monetary-account-bank` | Session token | No | List all bank accounts |
| POST | `/user/{uid}/monetary-account-bank` | Session token | Yes | Create a new bank account |
| POST | `/user/{uid}/monetary-account/{aid}/payment` | Session token | Yes | Send a payment |
| GET | `/user/{uid}/monetary-account/{aid}/payment` | Session token | No | List payments (transactions) |
| GET | `/user/{uid}/monetary-account/{aid}/payment/{pid}` | Session token | No | Get a specific payment |
| POST | `/user/{uid}/monetary-account/{aid}/request-inquiry` | Session token | Yes | Create a payment request |
| GET | `/user/{uid}/monetary-account/{aid}/request-inquiry` | Session token | No | List payment requests |
| POST | `/user/{uid}/monetary-account/{aid}/bunqme-tab` | Session token | Yes | Create a bunq.me payment link |
| GET | `/user/{uid}/monetary-account/{aid}/bunqme-tab` | Session token | No | List bunq.me tabs |
| GET | `/user/{uid}/monetary-account/{aid}/bunqme-tab/{tid}` | Session token | No | Get a specific bunq.me tab |
| POST | `/user/{uid}/notification-filter-url` | Session token | Yes | Register callback (webhook) filters |
| GET | `/user/{uid}/notification-filter-url` | Session token | No | List active callback filters |

## Required Headers

Every request needs these headers:

```
Cache-Control: no-cache
User-Agent: bunq-hackathon-toolkit/1.0
X-Bunq-Client-Request-Id: {random UUID}
X-Bunq-Language: en_US
X-Bunq-Region: nl_NL
X-Bunq-Geolocation: 0 0 0 0 000
```

Authenticated requests also need:

```
X-Bunq-Client-Authentication: {session_token or installation_token}
```

POST/PUT requests that require signing also need:

```
X-Bunq-Client-Signature: {base64-encoded RSA-SHA256 signature of request body}
```

## Pagination

- Default: 10 results per page
- Maximum: 200 results per page (use `?count=200`)
- Response includes `Pagination` object with `older_url` and `newer_url`

## Rate Limits

| Method | Limit |
|--------|-------|
| GET | 3 per 3 seconds |
| POST | 5 per 3 seconds |
| PUT | 2 per 3 seconds |
| /session-server | 1 per 30 seconds |

Exceeding limits returns HTTP 429.

## Full Documentation

For the complete API reference with all 300+ endpoints, visit [doc.bunq.com](https://doc.bunq.com).
