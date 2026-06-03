# AI-Driven Disease Detection Web App

## Overview

AI-Driven Disease Detection Web App is a full-stack application built to help users detect plant diseases using Artificial Intelligence. The system allows users to upload crop leaf images and receive disease predictions along with detailed insights, prevention methods, and treatment suggestions.

The project uses a **Flask backend** for API handling and machine learning integration, and a **React frontend** for a modern and interactive user experience.

---

# Features

* AI-powered plant disease detection
* Upload crop leaf images for prediction
* Supports multiple crop disease categories
* User authentication (Signup & Login)
* Dashboard for accessing reports and predictions
* Weather-based disease risk analysis
* PDF report generation
* Analytics dashboard
* Profile image upload support
* Responsive React frontend

---

# AI Disease Detection

The application uses a trained deep learning model to classify plant diseases from uploaded leaf images. After prediction, the system provides:

* Disease name
* Description
* Prevention methods
* Treatment suggestions
* Weather-based risk insights

---

# Tech Stack

## Frontend

* React
* Vite
* HTML/CSS
* JavaScript

## Backend

* Flask
* Python
* SQLite / Database integration

## AI & APIs

* Gemini API
* Deep Learning Disease Detection Model

---

# Project Structure

```bash
project-root/
│
├── backend/
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env
│
├── static/
│   ├── uploads/
│   └── frontend/
│
├── ai_report.py
├── app.py
├── requirements.txt
├── run-dev.ps1
├── run-dev.sh
└── README.md
```

---

# Environment Variables

This project uses environment variables for API keys and configuration.

These files are not included in the repository for security reasons.

---

## Backend Environment Variables

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
```

---

## Frontend Environment Variables

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_BASE=http://localhost:5000
```

These variables allow the frontend to communicate with the Flask backend and enable AI API access.

---

# Installation & Setup

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

---

## 2. Start the Flask Backend

From the repository root:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask server:

```bash
python app.py
```

---

## 3. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Run Backend + Frontend Together

The project includes helper scripts to start both servers simultaneously.

## Windows (PowerShell)

```powershell
.\run-dev.ps1
```

## macOS / Linux

```bash
./run-dev.sh
```

This will open the Flask backend and Vite frontend in separate terminals.

---

# Production Build

To build the React frontend for production:

```bash
cd frontend
npm run build
```

The production build output will be generated inside:

```bash
static/frontend
```

The Flask server will automatically serve the frontend build.

---

# Future Improvements

* Mobile application support
* Multi-language support for farmers
* Real-time crop monitoring
* Live weather API integration
* Advanced analytics and recommendations

---

# Contributors

Aastha Srivastava

