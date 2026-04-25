import httpx

async def reverse_geocode(lat: float, lng: float) -> dict:
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lng, "format": "json"},
                headers={"User-Agent": "snap-by-bunq-hackathon/1.0"},
            )
            data = r.json()
            address = data.get("address", {})
            city = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("county")
                or "Unknown location"
            )
            return {
                "city": city,
                "country_code": address.get("country_code", "").upper(),
            }
        except Exception:
            return {"city": "Unknown location", "country_code": ""}
