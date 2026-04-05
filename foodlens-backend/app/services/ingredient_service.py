def extract_ingredients(text: str):
    """
    Extract ingredients from OCR text
    """
    text = text.lower()

    # Try to find "ingredients" section
    if "ingredients" in text:
        text = text.split("ingredients")[-1]

    # Split by common separators
    raw_items = text.replace("\n", ",").split(",")

    # Clean items
    ingredients = []
    for item in raw_items:
        cleaned = item.strip()
        if cleaned:
            ingredients.append(cleaned)

    return ingredients