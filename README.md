# 🍽️ FoodLens

FoodLens is a mobile-based application that analyzes food product images, extracts ingredients using OCR, and provides health insights based on detected ingredients.

---

## 🚀 Features

* 📸 Scan food labels using mobile camera
* 🔍 OCR-based ingredient extraction
* ⚠️ Allergen detection (milk, soy, nuts, etc.)
* 🧠 Smart ingredient cleaning & normalization
* 📊 Health risk classification (Safe / Caution / Avoid)

---

## 🛠️ Tech Stack

### Frontend

* React Native (Expo)
* TypeScript
* Expo Router

### Backend

* FastAPI
* EasyOCR
* OpenCV
* Python

---

## ⚙️ Setup Instructions

### 📦 Clone the Repository

```bash
git clone https://github.com/your-username/foodlens.git
cd foodlens
```

---

## 🖥️ Backend Setup (FastAPI)

```bash
cd foodlens-backend

# Activate virtual environment
venv\Scripts\activate

# Run backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

👉 Backend will run at:
`http://localhost:8000`

---

## 📱 Frontend Setup (Expo)

```bash
cd foodlens

# Install dependencies (if not installed)
npm install

# Start Expo server
npx expo start
```

👉 Scan QR code using Expo Go app on your phone

---

## 🔗 API Configuration

Make sure your frontend `.env` has:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
```

---

## ⚠️ Important Notes

* Ensure your phone and backend are on the **same network**
* Always scan the **ingredients section**, not nutrition facts
* For better OCR accuracy:

  * Use good lighting
  * Keep camera steady
  * Zoom into ingredients

---

## 📌 Future Improvements

* 🤖 AI-based ingredient correction
* 📦 Product database integration
* 🌐 Cloud deployment
* 📊 Detailed health scoring system


