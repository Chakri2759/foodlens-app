from fastapi import APIRouter, HTTPException
from app.database import db
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

# ---------------- MODELS ---------------- #

class LoginModel(BaseModel):
    email: str
    password: str


class UserModel(BaseModel):
    name: str
    email: str
    password: str
    age: str
    gender: str
    health_conditions: list
    allergies: list


# ---------------- CREATE USER ---------------- #

@router.post("/create-user")
async def create_user(user: dict):
    try:
        existing = await db.users.find_one({"email": user.get("email")})
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        result = await db.users.insert_one(user)

        return {"id": str(result.inserted_id)}

    except Exception as e:
        print("CREATE USER ERROR:", e)
        raise HTTPException(status_code=500, detail="Server error")


# ---------------- GET USER ---------------- #

@router.get("/get-user/{user_id}")
async def get_user(user_id: str):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Clean response
    return {
        "_id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "health_conditions": user.get("health_conditions", []),
        "allergies": user.get("allergies", [])
    }


# ---------------- LOGIN ---------------- #

@router.post("/login")
async def login(user: LoginModel):
    try:
        found_user = await db.users.find_one({
            "email": user.email,
            "password": user.password
        })

        if not found_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # ✅ Clean & safe response (NO raw Mongo object)
        return {
            "message": "Login successful",
            "user": {
                "_id": str(found_user["_id"]),
                "name": found_user.get("name"),
                "email": found_user.get("email"),
                "age": found_user.get("age"),
                "gender": found_user.get("gender"),
                "health_conditions": found_user.get("health_conditions", []),
                "allergies": found_user.get("allergies", [])
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print("LOGIN ERROR:", e)
        raise HTTPException(status_code=500, detail="Server error")


# ---------------- UPDATE USER ---------------- #

@router.put("/update-user/{user_id}")
async def update_user(user_id: str, updated_data: dict):
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updated_data}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated"}