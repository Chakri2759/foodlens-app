import easyocr
import cv2
import numpy as np
import re
from rapidfuzz import process

# ==============================
# 🔥 LOAD OCR MODEL
# ==============================
reader = easyocr.Reader(['en'], gpu=False)


# ==============================
# 🧠 AUTO TEXT REGION DETECTION
# ==============================
def detect_text_region(image_path):
    img = cv2.imread(image_path)
    orig = img.copy()

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edged = cv2.Canny(gray, 50, 150)

    kernel = np.ones((5, 5), np.uint8)
    dilated = cv2.dilate(edged, kernel, iterations=2)

    contours, _ = cv2.findContours(
        dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    max_area = 0
    best_box = None

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h

        if area > max_area and w > 100 and h > 100:
            max_area = area
            best_box = (x, y, w, h)

    if best_box:
        x, y, w, h = best_box

        pad = 20
        x = max(0, x - pad)
        y = max(0, y - pad)
        w = w + pad * 2
        h = h + pad * 2

        cropped = orig[y:y+h, x:x+w]
        return cropped

    return orig


# ==============================
# 🔍 OCR
# ==============================
def extract_text(image_path):
    try:
        cropped = detect_text_region(image_path)

        cropped = cv2.resize(cropped, None, fx=2, fy=2)
        gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)

        results = reader.readtext(gray, paragraph=True, detail=0)

        print("\n===== RAW OCR TEXT =====")
        for res in results:
            print(res)
        print("========================\n")

        text = "\n".join(results)
        return clean_text(text)

    except Exception as e:
        print("OCR ERROR:", e)
        return ""


# ==============================
# 🧹 CLEAN TEXT (SMART)
# ==============================
def clean_text(text):
    text = text.lower()

    # 🔥 Fix common OCR mistakes
    corrections = {
        "faqu": "flour",
        "faqu r": "flour",
        "lechh": "lecithin",
        "lech": "lecithin",
        "soya": "soy",
        "soy4": "soy",
        "mikk": "milk",
        "chdcco": "choco",
        "lquo": "liquor",
        "ingre dients": "ingredients"
    }

    for wrong, right in corrections.items():
        text = text.replace(wrong, right)

    # Keep commas for splitting
    text = re.sub(r'[^a-z,\s]', ' ', text)

    # Normalize spaces
    text = re.sub(r'\s+', ' ', text)

    return text.strip()


# ==============================
# 🧠 SPLIT INGREDIENTS
# ==============================
def split_candidates(text):
    parts = re.split(r'[,\n]', text)

    cleaned = []
    for p in parts:
        p = p.strip()
        if len(p) > 2:
            cleaned.append(p)

    return cleaned


# ==============================
# 🧠 INGREDIENT DATABASE
# ==============================
KNOWN_INGREDIENTS = [
    "wheat flour", "flour", "sugar", "salt",
    "soy lecithin", "lecithin", "milk", "milk solids",
    "cocoa butter", "cocoa liquor", "chocolate",
    "vegetable oil", "palm oil", "soybean oil",
    "corn syrup", "glucose", "fructose",
    "whole egg", "egg", "egg whites",
    "baking powder", "sodium bicarbonate",
    "artificial flavor", "natural flavor",
    "butter", "cream", "starch"
]


# ==============================
# 🔥 FUZZY MATCH
# ==============================
def correct_phrase(phrase):
    match = process.extractOne(phrase, KNOWN_INGREDIENTS)

    if match and match[1] > 75:
        return match[0]

    return None


# ==============================
# 🧠 INGREDIENT EXTRACTION
# ==============================
def extract_ingredients(text):
    text = text.lower()

    # Extract only ingredients section
    match = re.search(r'ingredients[:\-]?\s*(.*)', text, re.DOTALL)
    if match:
        text = match.group(1)

    candidates = split_candidates(text)

    ingredients = []

    for item in candidates:
        item = item.strip()

        if len(item) < 3:
            continue

        corrected = correct_phrase(item)

        if corrected:
            ingredients.append(corrected)
        else:
            # fallback: keep short readable words
            if len(item.split()) <= 3:
                ingredients.append(item)

    # remove duplicates
    ingredients = list(set(ingredients))

    return ingredients


# ==============================
# 🚨 ALLERGEN DETECTION
# ==============================
def detect_allergens(text):
    keywords = ["wheat", "milk", "egg", "soy", "nuts", "peanut"]
    return list({k for k in keywords if k in text})


# ==============================
# 📦 PRODUCT NAME
# ==============================
def extract_product_name(text):
    words = text.split()
    return " ".join(words[:5]) if words else ""


# ==============================
# 🚀 MAIN PIPELINE
# ==============================
def analyze_product(image_path):
    text = extract_text(image_path)

    ingredients = extract_ingredients(text)
    allergens = detect_allergens(text)

    final_result = "SAFE" if ingredients else "UNKNOWN"

    return {
        "product_name": extract_product_name(text),
        "ingredients": [
            {
                "original": ing,
                "simple": ing
            }
            for ing in ingredients
        ],
        "matched_allergens": allergens,
        "health_warnings": [],
        "data_source": "OCR",
        "final_result": final_result
    }