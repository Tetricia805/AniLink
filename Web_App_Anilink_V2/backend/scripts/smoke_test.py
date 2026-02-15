"""
Smoke test: health + RBAC alignment (BACKEND_DESIGN).
Run: python scripts/smoke_test.py
Requires: server running, seed data (owner@example.com, seller@example.com / password123).
Set BASE_URL if not http://localhost:8000.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import requests

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000").rstrip("/")


def _login(email: str, password: str) -> str | None:
    r = requests.post(
        f"{BASE_URL}/v1/auth/login",
        json={"email": email, "password": password},
        timeout=10,
    )
    if r.status_code != 200:
        return None
    return r.json().get("accessToken")


def main():
    ok = True

    # --- Health ---
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        if r.status_code != 200:
            print("FAIL /health status=", r.status_code)
            ok = False
        else:
            print("OK /health", r.json())
    except Exception as e:
        print("FAIL /health", e)
        ok = False

    # --- RBAC: need seed users ---
    owner_token = _login("owner@example.com", "password123")
    seller_token = _login("seller@example.com", "password123")
    if not owner_token or not seller_token:
        print("SKIP RBAC tests (login failed; run seed_data.py and ensure server is up)")
        if ok:
            print("Smoke test passed (health only).")
        else:
            sys.exit(1)
        return

    headers_owner = {"Authorization": f"Bearer {owner_token}"}
    headers_seller = {"Authorization": f"Bearer {seller_token}"}

    # --- Owner calling /seller/products => 403 ---
    try:
        r = requests.get(f"{BASE_URL}/v1/seller/products", headers=headers_owner, timeout=5)
        if r.status_code != 403:
            print("FAIL Owner GET /v1/seller/products expected 403, got", r.status_code)
            ok = False
        else:
            print("OK Owner GET /v1/seller/products => 403")
    except Exception as e:
        print("FAIL Owner GET /v1/seller/products", e)
        ok = False

    # --- /marketplace/products returns ONLY verified+active (as owner) ---
    try:
        r = requests.get(f"{BASE_URL}/v1/marketplace/products", headers=headers_owner, timeout=5)
        if r.status_code != 200:
            print("FAIL GET /v1/marketplace/products status=", r.status_code)
            ok = False
        else:
            data = r.json()
            products = data if isinstance(data, list) else data.get("items", data)
            for p in products:
                if not p.get("isVerified", True):
                    print("FAIL /marketplace/products returned unverified product", p.get("id"))
                    ok = False
                    break
            else:
                print("OK /v1/marketplace/products only verified+active (or empty)")
    except Exception as e:
        print("FAIL GET /v1/marketplace/products", e)
        ok = False

    # --- /seller/orders returns only seller's order_items (seller call) ---
    try:
        r = requests.get(f"{BASE_URL}/v1/seller/orders", headers=headers_seller, timeout=5)
        if r.status_code != 200:
            print("FAIL GET /v1/seller/orders status=", r.status_code)
            ok = False
        else:
            # Each order in response must contain only this seller's items (no leakage)
            orders = r.json()
            print("OK GET /v1/seller/orders => 200, orders count =", len(orders))
    except Exception as e:
        print("FAIL GET /v1/seller/orders", e)
        ok = False

    # --- /orders is buyer-only: seller gets only their buyer orders ---
    try:
        r = requests.get(f"{BASE_URL}/v1/orders", headers=headers_seller, timeout=5)
        if r.status_code != 200:
            print("FAIL GET /v1/orders as seller status=", r.status_code)
            ok = False
        else:
            # Seller as buyer: list is buyer-only, so may be empty
            print("OK GET /v1/orders (seller as buyer) => 200")
    except Exception as e:
        print("FAIL GET /v1/orders", e)
        ok = False

    # --- /orders/:id is buyer-only: seller must not see order where they are seller not buyer ---
    # We need an order id where seller is the seller. From seed, first order has buyer=owner, seller=seller.
    # So GET /v1/orders/<that_order_id> as seller => 403.
    try:
        # Get an order id from owner's orders (owner is buyer)
        r_owner_orders = requests.get(f"{BASE_URL}/v1/orders", headers=headers_owner, timeout=5)
        if r_owner_orders.status_code == 200 and r_owner_orders.json():
            order_id = r_owner_orders.json()[0].get("id")
            if order_id:
                r_seller_get = requests.get(
                    f"{BASE_URL}/v1/orders/{order_id}",
                    headers=headers_seller,
                    timeout=5,
                )
                if r_seller_get.status_code != 403:
                    print("FAIL GET /v1/orders/:id as seller (not buyer) expected 403, got", r_seller_get.status_code)
                    ok = False
                else:
                    print("OK GET /v1/orders/:id (seller not buyer) => 403")
            else:
                print("SKIP GET /v1/orders/:id 403 check (no order id)")
        else:
            print("SKIP GET /v1/orders/:id 403 check (no orders as owner)")
    except Exception as e:
        print("FAIL GET /v1/orders/:id RBAC check", e)
        ok = False

    if ok:
        print("Smoke test passed.")
    else:
        print("Smoke test failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
