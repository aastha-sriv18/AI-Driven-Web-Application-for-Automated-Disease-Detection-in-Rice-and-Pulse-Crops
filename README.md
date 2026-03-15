# AI-Driven Disease Detection Web App

This project is a Flask backend + React frontend application for user signup, login, and dashboard access. The React frontend replaces the previous Flask-Jinja templates and uses the existing database logic to store users and profile images.

## How to run

### 1) Environment Variables

This project uses environment variables for API keys and configuration.  
These files are **not included in the repository for security reasons**.

After cloning the repository, create the following files manually.

## Backend (`backend/.env`)

Create a `.env` file inside the `backend` folder:

```
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
```

## Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend` folder:

```
VITE_API_BASE=http://localhost:5000
```

These variables allow the frontend to communicate with the Flask backend and enable AI API access.


### 2) Start the Flask API server

```powershell
# From the repo root
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3) Start the React frontend (development mode)

```powershell
cd frontend
npm install
npm run dev
```

### 4) Start backend + frontend together (single command)

From the repo root you can run the included helper script:

- PowerShell (Windows):

```powershell
.\run-dev.ps1
```

- macOS / Linux:

```bash
./run-dev.sh
```

This will open the Flask backend and Vite frontend in separate terminals.

### 5) Build the frontend for production

```powershell
cd frontend
npm run build
```

The build output is written into `static/frontend`, and the Flask server will serve it automatically.
