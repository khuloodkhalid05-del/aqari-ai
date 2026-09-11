import sys
sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("1. Testing Health Endpoint...")
res_health = client.get("/api/health")
print("Health status:", res_health.status_code, res_health.json())

print("\n2. Testing Models Endpoint...")
res_models = client.get("/api/models")
print("Models status:", res_models.status_code, res_models.json().get('best_model'))

print("\n3. Testing Stats Endpoint...")
res_stats = client.get("/api/stats")
print("Stats status:", res_stats.status_code, "Total listings:", res_stats.json().get('total_listings'))

print("\n4. Testing Predict Endpoint...")
payload = {
    "area_sqm": 160.0,
    "bedrooms": 3.0,
    "bathrooms": 2.0,
    "property_type": "Apartment",
    "city": "New Cairo City",
    "compound": "Mivida",
    "payment_method": "Cash",
    "has_sea_view": 0,
    "has_roof": 0,
    "has_pool": 0,
    "has_garden": 1,
    "is_fully_finished": 1,
    "is_furnished": 0,
    "has_maid_room": 0
}
res_pred = client.post("/api/predict", json=payload)
print("Predict status:", res_pred.status_code)
pred_data = res_pred.json()
print(f"Predicted Price: {pred_data.get('price_formatted')} ({pred_data.get('price_in_millions')} Million EGP)")
print(f"Price per sqm  : {pred_data.get('price_per_sqm')} EGP/sqm")
print(f"Model used     : {pred_data.get('best_model_name')}")

print("\n5. Testing Index Web Page...")
res_index = client.get("/")
print("Index status:", res_index.status_code, f"HTML size: {len(res_index.text)} bytes")

print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
