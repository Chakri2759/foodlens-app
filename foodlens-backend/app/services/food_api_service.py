import requests

def fetch_product_data(query: str):
    """
    Fetch product data from OpenFoodFacts
    """
    try:
        url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&json=1"
        
        response = requests.get(url)
        data = response.json()

        if "products" not in data or len(data["products"]) == 0:
            return None

        product = data["products"][0]

        return {
            "product_name": product.get("product_name", ""),
            "ingredients_text": product.get("ingredients_text", ""),
            "nutriments": product.get("nutriments", {})
        }

    except Exception as e:
        print("API ERROR:", e)
        return None