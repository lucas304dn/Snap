# Troubleshooting

## Common Errors

### HTTP 401 — Unauthorized

**Cause:** Your session has expired or the token is invalid.

**Fix:** Delete `bunq_context.json` and run your script again to re-authenticate.

```bash
rm bunq_context.json
python 01_authentication.py
```

### HTTP 403 — Forbidden

**Cause:** Your device was registered with a specific IP, but you're now on a different IP (e.g., switched WiFi networks).

**Fix:** Delete `bunq_context.json` and re-authenticate. The toolkit uses `permitted_ips: ["*"]` (wildcard) by default, so this shouldn't normally happen.

### HTTP 429 — Too Many Requests

**Cause:** You hit the API rate limit.

**Limits:**
- GET: 3 requests per 3 seconds
- POST: 5 requests per 3 seconds
- PUT: 2 requests per 3 seconds
- /session-server: 1 request per 30 seconds

**Fix:** Wait a few seconds and try again. If you keep hitting limits on session creation, make sure `bunq_context.json` is being saved properly (it caches your session so you don't re-authenticate every run).

### HTTP 400 — Bad Request

**Cause:** Missing or invalid fields in your request body.

**Fix:** Check the request body against the [API Reference](API_REFERENCE.md). Common mistakes:
- Missing `currency` when creating an account
- Wrong format for `amount` (must be `{"value": "10.00", "currency": "EUR"}`)
- Missing `counterparty_alias` fields in payments

### Connection Errors

**Cause:** Wrong base URL or network issues.

**Fix:**
- Sandbox: `https://public-api.sandbox.bunq.com`
- Production: `https://api.bunq.com`
- Check your internet connection

### RSA / Signature Errors

**Cause:** Key format issues or signing mismatch.

**Fix:** Delete `bunq_context.json` to regenerate keys and start fresh. The toolkit handles RSA key generation and signing automatically.

### "No active monetary account found"

**Cause:** `get_primary_account_id()` couldn't find an active bank account.

**Fix:** Run `02_create_monetary_account.py` first to create one, or check that your sandbox user was set up correctly.

## Tips

- **Always run scripts from the `python/` directory** so that `bunq_context.json` and imports work correctly.
- **Don't commit `bunq_context.json`** — it contains your private key and session tokens. The `.gitignore` already excludes it.
- **Sandbox money:** Request up to EUR 500 from `sugardaddy@bunq.com` (script 03 does this automatically).
- **Rate limits:** If scripts fail with 429, just wait a few seconds. The context cache prevents most rate limit issues.

## Getting Help

- [bunq API Documentation](https://doc.bunq.com)
- [bunq Developer Portal](https://developer.bunq.com)
