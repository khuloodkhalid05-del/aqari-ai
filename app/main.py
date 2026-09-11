import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.schemas import PredictionRequest, PredictionResponse, ModelsComparisonResponse, DatasetStatsResponse
from app.predictor import predict_house_price, get_metadata

app = FastAPI(
    title="Egyptian House Price Predictor API",
    description="Machine Learning Powered Real Estate Valuation for Egypt",
    version="1.0.0"
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount static directory if it exists
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Egyptian House Price Prediction API is running. Visit /docs for Swagger."}

@app.post("/api/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        response = predict_house_price(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/api/models")
def get_models_comparison():
    meta = get_metadata()
    return {
        "best_model": meta.get("best_model", "LightGBM Regressor"),
        "r2_score": meta.get("r2_score", 0.6124),
        "mae": meta.get("mae", 2777060.14),
        "rmse": meta.get("rmse", 4775561.31),
        "models": meta.get("models_comparison", [])
    }

@app.get("/api/stats")
def get_dataset_stats():
    meta = get_metadata()
    opts = meta.get("options", {})
    stats = meta.get("dataset_stats", {})
    return {
        "total_listings": stats.get("total_listings", 14279),
        "median_price": stats.get("median_price", 8400000.0),
        "mean_price": stats.get("mean_price", 10389328.0),
        "median_area": stats.get("median_area", 150.0),
        "cities_count": stats.get("cities_count", 67),
        "cities": opts.get("cities", []),
        "governorates": opts.get("governorates", []),
        "compounds": opts.get("compounds", []),
        "types": opts.get("types", [])
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Egyptian House Price Predictor", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
