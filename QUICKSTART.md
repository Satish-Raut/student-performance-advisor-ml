# 🚀 Project Quickstart Guide
### Student Performance & At-Risk Prediction (Production ML System)

This guide provides step-by-step instructions to run the Backend (FastAPI) and Frontend (React + Vite), or start the entire project.

---

## 📋 Prerequisites

- **Python**: `>= 3.11` (Python 3.13 tested)
- **uv**: Installed (`uv --version`) for ultra-fast Python dependency & venv management
- **Node.js**: `>= 18.x` (Node 24 tested) and **npm**

---

## ⚡ Quick Start: Running Both Services

### Terminal 1: Backend (FastAPI)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Activate the virtual environment
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Windows (CMD):
.venv\Scripts\activate.bat
# On macOS / Linux:
source .venv/bin/activate

# 3. Start the FastAPI server using uvicorn
uvicorn api.main:app --reload --port 8000
```

- **Backend API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc Docs**: `http://localhost:8000/redoc`
- **Health Check Endpoint**: `http://localhost:8000/health`

---

### Terminal 2: Frontend (React + Vite)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Start the Vite development server
npm run dev
```

- **Frontend App URL**: `http://localhost:5173`

---

## 🛠️ First-Time Setup Instructions

If you are setting up the project on a new machine or from a fresh clone:

### 1. Backend Setup (using `uv`)

```bash
cd backend

# Create virtual environment with uv
uv venv

# Activate virtualenv (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install all backend dependencies in seconds
uv pip install -r requirements.txt

# Create local environment configuration
copy .env.example .env
```

### 2. Model Training & Exporting Artifacts

Before running the API for the first time, train the model to generate the `.pkl` artifact:

```bash
cd backend
.venv\Scripts\Activate.ps1
python src/student_data_analysis_and_Model_training.py
# Generates: backend/models/at_risk_pipeline.pkl
```

### 3. Frontend Setup (React)

```bash
cd frontend

# Install UI dependencies
npm install
```

---

## 🧪 Running Tests & Quality Checks

### Backend Unit & Integration Tests

```bash
cd backend
.venv\Scripts\Activate.ps1

# Run pytest test suite
python -m pytest tests/ -v
```

### Frontend Build Verification

```bash
cd frontend

# Test production build
npm run build
```

---

## 📂 Project Directory Overview

```
ALGIONS AI LABS/
├── README.md                  # Comprehensive project documentation
├── QUICKSTART.md              # Fast start commands (root copy)
│
├── docs/                      # 📚 Project Guides & Reference
│   ├── QUICKSTART.md          # Quickstart guide
│   ├── Project_Architecture.md # System architecture & MLOps design
│   └── Student_AtRisk_Project_Guide.md # Assessment & rubric guide
│
├── backend/                   # 🐍 FastAPI Backend
│   ├── .venv/                 # uv-managed virtual environment
│   ├── api/                   # FastAPI endpoints, schemas, database logging
│   ├── data/
│   │   ├── raw/               # student-mat.csv, student-por.csv
│   │   └── processed/         # Merged & cleaned datasets
│   ├── models/                # Saved trained artifacts (.pkl)
│   ├── notebooks/             # EDA & training Jupyter notebooks
│   ├── src/                   # Model training scripts
│   ├── tests/                 # Automated pytest test cases
│   ├── .env                   # Local environment variables
│   ├── pyproject.toml         # Python project configuration
│   └── requirements.txt       # Backend dependencies
│
└── frontend/                  # ⚛️ React + Vite Frontend
    ├── src/                   # React components, pages, dashboard
    ├── package.json           # Frontend packages & scripts
    └── vite.config.js         # Vite configuration
```
