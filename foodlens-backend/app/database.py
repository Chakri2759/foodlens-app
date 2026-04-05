import os
from motor.motor_asyncio import AsyncIOMotorClient

# ✅ Read Mongo URL from environment
MONGO_URL = "mongodb+srv://chakriramisetti555_db_user:ylccNmTKk4jiq0qe@userdata.jtivg09.mongodb.net/foodlens?retryWrites=true&w=majority"

if not MONGO_URL:
    raise ValueError("MONGO_URL is not set")

# ✅ Create client
client = AsyncIOMotorClient(MONGO_URL)

# ✅ Database reference
db = client.foodlens