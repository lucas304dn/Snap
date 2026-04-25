import os
import logging
from services.bunq_client import BunqClient

logger = logging.getLogger(__name__)

_bunq_client: BunqClient | None = None


def get_bunq_client() -> BunqClient | None:
    return _bunq_client


def init_bunq(webhook_url: str | None = None) -> None:
    global _bunq_client

    api_key = os.getenv("BUNQ_API_KEY", "").strip()
    if not api_key:
        logger.warning("[bunq] BUNQ_API_KEY not set — running in demo-only mode")
        return

    sandbox = os.getenv("BUNQ_ENVIRONMENT", "SANDBOX").upper() == "SANDBOX"

    try:
        client = BunqClient(api_key=api_key, sandbox=sandbox)
        client.authenticate()
        logger.info(f"[bunq] Authenticated — user_id={client.user_id}")
        _bunq_client = client

        if webhook_url:
            _register_webhook(client, webhook_url)
        else:
            logger.warning("[bunq] WEBHOOK_URL not set — skipping webhook registration")

    except Exception as e:
        logger.error(f"[bunq] Init failed: {e}")


def _register_webhook(client: BunqClient, url: str) -> None:
    try:
        client.post(
            f"user/{client.user_id}/notification-filter-url",
            {
                "notification_filters": [
                    {"category": "PAYMENT", "notification_target": url},
                    {"category": "MUTATION", "notification_target": url},
                ],
            },
        )
        logger.info(f"[bunq] Webhook registered → {url}")
    except Exception as e:
        logger.error(f"[bunq] Webhook registration failed: {e}")
