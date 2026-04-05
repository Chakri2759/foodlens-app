ALLERGENS = [
    "milk", "peanut", "soy", "gluten",
    "egg", "wheat", "almond", "cashew"
]

def detect_allergens(ingredients):
    found = []

    for ingredient in ingredients:
        for allergen in ALLERGENS:
            if allergen in ingredient:
                found.append(allergen)

    return list(set(found))  # remove duplicates