"""
Lightweight bunq API client — handles authentication, request signing, and context caching.

Usage:
    from bunq_client import BunqClient

    client = BunqClient(api_key="sandbox_xxx", sandbox=True)
    client.authenticate()

    # Now make API calls:
    accounts = client.get(f"user/{client.user_id}/monetary-account-bank")
"""

import base64
import json
import os
import uuid

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

SANDBOX_BASE_URL = "https://public-api.sandbox.bunq.com"
PRODUCTION_BASE_URL = "https://api.bunq.com"
API_VERSION = "v1"
CONTEXT_FILE = "bunq_context.json"


class BunqClient:
    def __init__(self, api_key: str, sandbox: bool = True):
        self.api_key = api_key
        self.sandbox = sandbox
        self.base_url = SANDBOX_BASE_URL if sandbox else PRODUCTION_BASE_URL

        self.installation_token: str | None = None
        self.server_public_key: str | None = None
        self.session_token: str | None = None
        self.user_id: int | None = None

        self._private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        self._public_key_pem = self._private_key.public_key().public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode()

    # ------------------------------------------------------------------
    # Static helper: create a sandbox user (no auth needed)
    # ------------------------------------------------------------------

    @staticmethod
    def create_sandbox_user() -> str:
        resp = requests.post(
            f"{SANDBOX_BASE_URL}/{API_VERSION}/sandbox-user-person",
            headers={
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "User-Agent": "bunq-hackathon-toolkit/1.0",
                "X-Bunq-Client-Request-Id": str(uuid.uuid4()),
                "X-Bunq-Language": "en_US",
                "X-Bunq-Region": "nl_NL",
                "X-Bunq-Geolocation": "0 0 0 0 000",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["Response"][0]["ApiKey"]["api_key"]

    # ------------------------------------------------------------------
    # Authentication (3-step flow)
    # ------------------------------------------------------------------

    def authenticate(self) -> None:
        if self._load_context():
            if self._test_session():
                return

        self._step1_installation()
        self._step2_device_server()
        self._step3_session_server()
        self._save_context()

    def _step1_installation(self) -> None:
        body = {"client_public_key": self._public_key_pem}
        resp = self._raw_post("installation", body, auth_token=None)
        for item in resp:
            if "Token" in item:
                self.installation_token = item["Token"]["token"]
            if "ServerPublicKey" in item:
                self.server_public_key = item["ServerPublicKey"]["server_public_key"]

    def _step2_device_server(self) -> None:
        body = {
            "description": "bunq-hackathon-toolkit",
            "secret": self.api_key,
            "permitted_ips": ["*"],
        }
        self._raw_post("device-server", body, auth_token=self.installation_token)

    def _step3_session_server(self) -> None:
        body = {"secret": self.api_key}
        resp = self._raw_post("session-server", body, auth_token=self.installation_token)
        for item in resp:
            if "Token" in item:
                self.session_token = item["Token"]["token"]
            if "UserPerson" in item:
                self.user_id = item["UserPerson"]["id"]
            if "UserCompany" in item:
                self.user_id = item["UserCompany"]["id"]
            if "UserApiKey" in item:
                self.user_id = item["UserApiKey"]["id"]

    def _test_session(self) -> bool:
        try:
            self.get(f"user/{self.user_id}")
            return True
        except requests.HTTPError:
            return False

    # ------------------------------------------------------------------
    # HTTP methods (use these in tutorial scripts)
    # ------------------------------------------------------------------

    def get(self, endpoint: str, params: dict | None = None) -> list:
        return self._request("GET", endpoint, params=params)

    def post(self, endpoint: str, body: dict) -> list:
        return self._request("POST", endpoint, body=body)

    def put(self, endpoint: str, body: dict) -> list:
        return self._request("PUT", endpoint, body=body)

    def delete(self, endpoint: str) -> list:
        return self._request("DELETE", endpoint)

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    def get_primary_account_id(self) -> int:
        resp = self.get(f"user/{self.user_id}/monetary-account-bank")
        for item in resp:
            acc = item.get("MonetaryAccountBank", {})
            if acc.get("status") == "ACTIVE":
                return acc["id"]
        raise RuntimeError("No active monetary account found")

    # ------------------------------------------------------------------
    # Internal: HTTP request building, signing, context persistence
    # ------------------------------------------------------------------

    def _request(self, method: str, endpoint: str, body: dict | None = None, params: dict | None = None) -> list:
        url = f"{self.base_url}/{API_VERSION}/{endpoint}"
        headers = self._build_headers(body)
        json_body = body if method in ("POST", "PUT") else None

        resp = requests.request(method, url, headers=headers, json=json_body, params=params)
        resp.raise_for_status()
        return resp.json().get("Response", [])

    def _raw_post(self, endpoint: str, body: dict, auth_token: str | None) -> list:
        url = f"{self.base_url}/{API_VERSION}/{endpoint}"
        headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "User-Agent": "bunq-hackathon-toolkit/1.0",
            "X-Bunq-Client-Request-Id": str(uuid.uuid4()),
            "X-Bunq-Language": "en_US",
            "X-Bunq-Region": "nl_NL",
            "X-Bunq-Geolocation": "0 0 0 0 000",
        }
        if auth_token:
            headers["X-Bunq-Client-Authentication"] = auth_token

        body_bytes = json.dumps(body).encode()
        headers["X-Bunq-Client-Signature"] = self._sign(body_bytes)

        resp = requests.post(url, headers=headers, data=body_bytes)
        resp.raise_for_status()
        return resp.json().get("Response", [])

    def _build_headers(self, body: dict | None = None) -> dict:
        headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "User-Agent": "bunq-hackathon-toolkit/1.0",
            "X-Bunq-Client-Authentication": self.session_token,
            "X-Bunq-Client-Request-Id": str(uuid.uuid4()),
            "X-Bunq-Language": "en_US",
            "X-Bunq-Region": "nl_NL",
            "X-Bunq-Geolocation": "0 0 0 0 000",
        }
        if body is not None:
            body_bytes = json.dumps(body).encode()
            headers["X-Bunq-Client-Signature"] = self._sign(body_bytes)
        return headers

    def _sign(self, body_bytes: bytes) -> str:
        signature = self._private_key.sign(
            body_bytes,
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        return base64.b64encode(signature).decode()

    # ------------------------------------------------------------------
    # Context save / load
    # ------------------------------------------------------------------

    def _save_context(self) -> None:
        context = {
            "api_key": self.api_key,
            "sandbox": self.sandbox,
            "private_key_pem": self._private_key.private_bytes(
                serialization.Encoding.PEM,
                serialization.PrivateFormat.PKCS8,
                serialization.NoEncryption(),
            ).decode(),
            "installation_token": self.installation_token,
            "server_public_key": self.server_public_key,
            "session_token": self.session_token,
            "user_id": self.user_id,
        }
        with open(CONTEXT_FILE, "w") as f:
            json.dump(context, f, indent=2)

    def _load_context(self) -> bool:
        if not os.path.exists(CONTEXT_FILE):
            return False
        try:
            with open(CONTEXT_FILE) as f:
                ctx = json.load(f)
            if ctx.get("api_key") != self.api_key or ctx.get("sandbox") != self.sandbox:
                return False
            self._private_key = serialization.load_pem_private_key(
                ctx["private_key_pem"].encode(),
                password=None,
            )
            self._public_key_pem = self._private_key.public_key().public_bytes(
                serialization.Encoding.PEM,
                serialization.PublicFormat.SubjectPublicKeyInfo,
            ).decode()
            self.installation_token = ctx["installation_token"]
            self.server_public_key = ctx["server_public_key"]
            self.session_token = ctx["session_token"]
            self.user_id = ctx["user_id"]
            return True
        except (json.JSONDecodeError, KeyError, ValueError):
            return False
