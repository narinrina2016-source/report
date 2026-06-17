import json
import requests
from app.core.security import create_access_token

results = {}
for user_id, email in [(1, "narin.rina2016@gmail.com"), (3, "admin@example.com")]:
    token = create_access_token(user_id)
    res = requests.get(
        "http://localhost:8000/api/v1/visit-requests/",
        headers={"Authorization": f"Bearer {token}"}
    )
    results[email] = {
        "status_code": res.status_code,
        "count": len(res.json()) if res.status_code == 200 else None,
        "data": res.json()
    }

with open("debug_api_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Successfully wrote api check results to debug_api_results.json")
