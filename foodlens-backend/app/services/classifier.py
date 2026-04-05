def classify_personal(allergens, health_flags):
    if allergens:
        return "AVOID"
    elif health_flags:
        return "CAUTION"
    else:
        return "SAFE"