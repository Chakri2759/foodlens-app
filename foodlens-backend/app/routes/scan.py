from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os

from app.services.ocr_service import (
    extract_text,
    extract_ingredients,
    extract_product_name,
    detect_allergens
)

router = APIRouter()


@router.post("/scan")
async def scan_label(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        os.makedirs("temp", exist_ok=True)
        path = f"temp/{file.filename}"

        # Save file
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # OCR
        text = extract_text(path)

        # Product name
        product_name = extract_product_name(text)

        # Ingredients
        ingredients = extract_ingredients(text)

        # 🔥 Allergen detection (FIXED)
        allergens = detect_allergens(text)

        # 🔥 Final result logic
        result = "SAFE"
        if allergens:
            result = "AVOID"

        os.remove(path)

        return {
            "product_name": product_name,
            "data_source": "OCR",
            "ingredients": ingredients,
            "matched_allergens": allergens,
            "health_warnings": [],
            "final_result": result
        }

    except Exception as e:
        return {"error": str(e)}