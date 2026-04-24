"""
Tutorial 01 — Authentication

Demonstrates the full bunq API auth flow step-by-step using raw HTTP calls.
This script does NOT use the BunqClient shortcut — it shows every request
so you can understand what happens under the hood.

Steps:
  1. Generate an RSA keypair
  2. POST /v1/installation      → register your public key
  3. POST /v1/device-server     → register your device
  4. POST /v1/session-server    → create a session
"""

import base64
import json
import os
import uuid

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://public-api.sandbox.bunq.com/v1"


def main() -> None:
    api_key = os.getenv("BUNQ_API_KEY", "").strip()

    # If no API key, create a sandbox user automatically
    if not api_key:
        print("No BUNQ_API_KEY set — creating a sandbox user...")
        resp = requests.post(
            f"{BASE_URL}/sandbox-user-person",
            headers=_base_headers(),
        )
        resp.raise_for_status()
        api_key = resp.json()["Response"][0]["ApiKey"]["api_key"]
        print(f"  Sandbox API key: {api_key}")
        print("  (save this in your .env file for next time)\n")

    # ---- Step 1: Generate RSA keypair ----
    print("Step 1: Generating RSA keypair...")
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key_pem = private_key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    print("  RSA 2048-bit keypair generated.\n")

    # ---- Step 2: POST /installation ----
    print("Step 2: POST /v1/installation — registering public key...")
    body = {"client_public_key": public_key_pem}
    resp = requests.post(
        f"{BASE_URL}/installation",
        headers=_base_headers(),
        json=body,
    )
    resp.raise_for_status()
    installation_data = resp.json()["Response"]

    installation_token = None
    server_public_key = None
    for item in installation_data:
        if "Token" in item:
            installation_token = item["Token"]["token"]
        if "ServerPublicKey" in item:
            server_public_key = item["ServerPublicKey"]["server_public_key"]

    print(f"  Installation token: {installation_token[:30]}...")
    print(f"  Server public key received: {len(server_public_key)} chars\n")

    # ---- Step 3: POST /device-server ----
    print("Step 3: POST /v1/device-server — registering device...")
    body = {
        "description": "hackathon-tutorial",
        "secret": api_key,
        "permitted_ips": ["*"],
    }
    body_bytes = json.dumps(body).encode()
    signature = _sign(private_key, body_bytes)

    headers = _base_headers()
    headers["X-Bunq-Client-Authentication"] = installation_token
    headers["X-Bunq-Client-Signature"] = signature

    resp = requests.post(f"{BASE_URL}/device-server", headers=headers, data=body_bytes)
    resp.raise_for_status()
    device_id = resp.json()["Response"][0]["Id"]["id"]
    print(f"  Device registered with id: {device_id}\n")

    # ---- Step 4: POST /session-server ----
    print("Step 4: POST /v1/session-server — creating session...")
    body = {"secret": api_key}
    body_bytes = json.dumps(body).encode()
    signature = _sign(private_key, body_bytes)

    headers = _base_headers()
    headers["X-Bunq-Client-Authentication"] = installation_token
    headers["X-Bunq-Client-Signature"] = signature

    resp = requests.post(f"{BASE_URL}/session-server", headers=headers, data=body_bytes)
    resp.raise_for_status()
    session_data = resp.json()["Response"]

    session_token = None
    user_id = None
    for item in session_data:
        if "Token" in item:
            session_token = item["Token"]["token"]
        for key in ("UserPerson", "UserCompany", "UserApiKey"):
            if key in item:
                user_id = item[key]["id"]

    print(f"  Session token: {session_token[:30]}...")
    print(f"  User ID: {user_id}\n")

    # ---- Done! ----
    print("Authentication complete! You can now make API calls.")
    print(f"  Example: GET /v1/user/{user_id}/monetary-account-bank")


def _base_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "User-Agent": "bunq-hackathon-toolkit/1.0",
        "X-Bunq-Client-Request-Id": str(uuid.uuid4()),
        "X-Bunq-Language": "en_US",
        "X-Bunq-Region": "nl_NL",
        "X-Bunq-Geolocation": "0 0 0 0 000",
    }


def _sign(private_key, body_bytes: bytes) -> str:
    signature = private_key.sign(body_bytes, padding.PKCS1v15(), hashes.SHA256())
    return base64.b64encode(signature).decode()


if __name__ == "__main__":
    main()
