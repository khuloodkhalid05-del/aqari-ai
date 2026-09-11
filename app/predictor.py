import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from app.schemas import PredictionRequest, PredictionResponse, AmenityEffect

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "app", "models", "best_model.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "app", "models", "model_metrics.json")

# Lazy loading of model and metadata
_pipeline = None
_metadata = None

# City to Governorate lookup fallback
CITY_TO_GOV = {
    "New Cairo City": "Cairo",
    "Nasr City": "Cairo",
    "Heliopolis - Masr El Gedida": "Cairo",
    "El Maadi": "Cairo",
    "Mokattam": "Cairo",
    "Zamalek": "Cairo",
    "Madinaty": "Cairo",
    "Shorouk City": "Cairo",
    "Badr City": "Cairo",
    "New Capital City": "Cairo",
    "Mostakbal City - Future City": "Cairo",
    "Sheikh Zayed City": "Giza",
    "6 October City": "Giza",
    "Dokki": "Giza",
    "Mohandessin": "Giza",
    "Al Agouza": "Giza",
    "Hadayek El Ahram": "Giza",
    "Hurghada": "Red Sea",
    "El Gouna": "Red Sea",
    "Marsa Alam": "Red Sea",
    "Al Ain Al Sokhna": "Suez",
    "Sharm El Sheikh": "South Sainai",
    "Ras Al Hekma": "North Coast",
    "Sidi Abdel Rahman": "North Coast",
    "Al Alamein": "North Coast",
    "North Coast Resorts": "North Coast",
    "Marsa Matrouh": "Matrouh",
    "Alexandria Compounds": "Alexandria",
    "Hay Awal El Montazah": "Alexandria"
}

def get_metadata() -> Dict[str, Any]:
    global _metadata
    if _metadata is None:
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        else:
            _metadata = {
                "best_model": "LightGBM Regressor",
                "r2_score": 0.6124,
                "mae": 2777060,
                "rmse": 4775561,
                "options": {
                    "types": ["Apartment", "Villa", "Chalet", "Duplex", "Penthouse", "Townhouse", "Twin House"],
                    "cities": list(CITY_TO_GOV.keys()),
                    "governorates": ["Cairo", "Giza", "Red Sea", "North Coast", "Alexandria"],
                    "compounds": ["Mivida", "Allegria", "Marassi", "Madinaty", "Hyde Park", "Swan Lake", "Other"]
                },
                "dataset_stats": {
                    "total_listings": 14279,
                    "median_price": 8400000,
                    "mean_price": 10389328,
                    "median_area": 150,
                    "cities_count": 67
                }
            }
    return _metadata

def get_model():
    global _pipeline
    if _pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        _pipeline = joblib.load(MODEL_PATH)
    return _pipeline

def predict_house_price(req: PredictionRequest) -> PredictionResponse:
    pipeline = get_model()
    meta = get_metadata()
    
    # Auto-resolve governorate if needed
    gov = req.governorate
    if not gov or gov == "Cairo" and req.city in CITY_TO_GOV:
        gov = CITY_TO_GOV.get(req.city, req.governorate or "Cairo")
    
    # Prepare DataFrame matching preprocessor features exactly
    input_row = {
        'area_sqm': float(req.area_sqm),
        'bedrooms_clean': float(req.bedrooms),
        'bathrooms_clean': float(req.bathrooms),
        'type_clean': str(req.property_type),
        'city': str(req.city),
        'governorate': str(gov),
        'compound': str(req.compound or 'Other'),
        'has_pool': int(req.has_pool),
        'has_garden': int(req.has_garden),
        'has_sea_view': int(req.has_sea_view),
        'is_furnished': int(req.is_furnished),
        'is_fully_finished': int(req.is_fully_finished),
        'has_maid_room': int(req.has_maid_room),
        'payment_method': str(req.payment_method)
    }
    
    df_input = pd.DataFrame([input_row])
    
    raw_pred = pipeline.predict(df_input)[0]
    predicted_val = float(max(100_000.0, raw_pred))
    
    # Roof premium estimation (if selected, boosts value roughly by 7% for penthouse/chalet/apartment)
    if req.has_roof:
        predicted_val *= 1.07
        
    price_in_millions = round(predicted_val / 1e6, 2)
    price_formatted = f"{int(predicted_val):,} EGP"
    price_per_sqm = round(predicted_val / req.area_sqm, 0)
    
    # Model uncertainty / confidence interval (based on model MAE ratio)
    mae_ratio = 0.15  # ~15% valuation spread band
    price_min = round(predicted_val * (1 - mae_ratio), -3)
    price_max = round(predicted_val * (1 + mae_ratio), -3)
    
    amenities = [
        AmenityEffect(name="إطلالة على البحر / بحيرة", icon="🌊", active=bool(req.has_sea_view), estimated_premium_pct=28.5),
        AmenityEffect(name="روف خاص", icon="⛱️", active=bool(req.has_roof), estimated_premium_pct=7.0),
        AmenityEffect(name="حمام سباحة خاص", icon="🏊", active=bool(req.has_pool), estimated_premium_pct=24.0),
        AmenityEffect(name="حديقة خاصة", icon="🌳", active=bool(req.has_garden), estimated_premium_pct=18.5),
        AmenityEffect(name="تشطيب كامل فاخر", icon="✨", active=bool(req.is_fully_finished), estimated_premium_pct=15.0),
        AmenityEffect(name="مفروش بالكامل", icon="🛋️", active=bool(req.is_furnished), estimated_premium_pct=12.0),
        AmenityEffect(name="غرفة خادمة", icon="👩‍💼", active=bool(req.has_maid_room), estimated_premium_pct=9.0)
    ]
    
    confidence = round(float(meta.get('r2_score', 0.6124) * 100), 1)
    
    return PredictionResponse(
        predicted_price=round(predicted_val, 2),
        price_formatted=price_formatted,
        price_in_millions=price_in_millions,
        price_per_sqm=price_per_sqm,
        price_range_min=price_min,
        price_range_max=price_max,
        confidence_score=confidence,
        best_model_name=meta.get('best_model', 'LightGBM Regressor'),
        property_summary={
            "area_sqm": req.area_sqm,
            "bedrooms": int(req.bedrooms),
            "bathrooms": int(req.bathrooms),
            "type": req.property_type,
            "city": req.city,
            "governorate": gov,
            "compound": req.compound,
            "payment_method": req.payment_method
        },
        amenities=amenities
    )
