from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PredictionRequest(BaseModel):
    area_sqm: float = Field(..., ge=20, le=2500, description="Area in square meters")
    bedrooms: float = Field(3.0, ge=1, le=12, description="Number of bedrooms")
    bathrooms: float = Field(2.0, ge=1, le=10, description="Number of bathrooms")
    property_type: str = Field("Apartment", description="Type of property e.g. Apartment, Villa, Chalet")
    city: str = Field("New Cairo City", description="City or District")
    governorate: Optional[str] = Field("Cairo", description="Governorate")
    compound: Optional[str] = Field("Other", description="Compound name")
    has_sea_view: int = Field(0, ge=0, le=1, description="1 if property has sea/lake/water view")
    has_roof: int = Field(0, ge=0, le=1, description="1 if property has a private roof")
    has_pool: int = Field(0, ge=0, le=1, description="1 if property has a private pool")
    has_garden: int = Field(0, ge=0, le=1, description="1 if property has a private garden")
    is_fully_finished: int = Field(1, ge=0, le=1, description="1 if fully finished")
    is_furnished: int = Field(0, ge=0, le=1, description="1 if furnished")
    has_maid_room: int = Field(0, ge=0, le=1, description="1 if includes maid room")
    payment_method: str = Field("Cash", description="Payment method: Cash or Installments")

class AmenityEffect(BaseModel):
    name: str
    icon: str
    active: bool
    estimated_premium_pct: float

class PredictionResponse(BaseModel):
    predicted_price: float
    price_formatted: str
    price_in_millions: float
    price_per_sqm: float
    price_range_min: float
    price_range_max: float
    confidence_score: float
    best_model_name: str
    property_summary: Dict[str, Any]
    amenities: List[AmenityEffect]

class ModelMetric(BaseModel):
    model: str
    r2: float
    mae: float
    rmse: float

class ModelsComparisonResponse(BaseModel):
    best_model: str
    r2_score: float
    mae: float
    rmse: float
    models: List[ModelMetric]

class DatasetStatsResponse(BaseModel):
    total_listings: int
    median_price: float
    mean_price: float
    median_area: float
    cities_count: int
    cities: List[str]
    governorates: List[str]
    compounds: List[str]
    types: List[str]
