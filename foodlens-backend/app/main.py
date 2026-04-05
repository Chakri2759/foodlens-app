from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Correct import (same folder)
from app.database import db
from app.routes import user, scan

app = FastAPI(
    title="FoodLens API",
    version="1.0.0"
)

# ✅ CORS (for Expo / React Native)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(user.router, tags=["User"])
app.include_router(scan.router, tags=["Scan"])

# ✅ Root route
@app.get("/")
async def home():
    return {"message": "Backend running 🚀"}

# ✅ Test DB
@app.get("/test-db")
async def test_db():
    try:
        collections = await db.list_collection_names()
        return {
            "status": "Connected ✅",
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "Failed ❌",
            "error": str(e)
        }