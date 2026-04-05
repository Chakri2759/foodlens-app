def check_user_risks(ingredients, user):
    user_allergies = user.get("allergies", [])
    health_conditions = user.get("health_conditions", [])

    matched_allergens = []
    health_flags = []

    # Check allergies
    for ing in ingredients:
        for allergy in user_allergies:
            if allergy in ing:
                matched_allergens.append(allergy)

    # Check health conditions (basic logic)
    for ing in ingredients:
        if "sugar" in ing and "diabetes" in health_conditions:
            health_flags.append("high sugar (diabetes risk)")

        if "salt" in ing and "bp" in health_conditions:
            health_flags.append("high salt (bp risk)")

    return list(set(matched_allergens)), list(set(health_flags))