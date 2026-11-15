import os
import csv
import io
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from api.schemas import (
    StudentPredictionInput,
    PredictionResponse,
    BatchStudentInput,
    BatchPredictionResponse,
    ModelMetadataResponse,
    AnalyticsSummaryResponse
)
from api.database import init_db, log_prediction, get_recent_logs, get_analytics_summary
from api.service import predict_student, load_pipeline, get_model_path, get_model_metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database synchronously on startup
    init_db()
    # Preload the production pipeline artifact
    pipeline = load_pipeline()
    if pipeline:
        print("[INFO] Production ML pipeline loaded successfully from artifact.")
    else:
        print(f"[NOTICE] ML artifact not found at {get_model_path()}. Running in advisory fallback mode.")
    yield

app = FastAPI(
    title="Student Performance & At-Risk Prediction API",
    description="Production-grade ML decision-support backend conforming to ALGIONS AI LABS assessment requirements.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite defaults to 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. System & Health Endpoints

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Student Performance & At-Risk Prediction API is operational",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_check": "/health"
    }

@app.get("/health", tags=["Health"])
def health():
    model_loaded = os.path.exists(get_model_path())
    return {
        "status": "healthy",
        "model_artifact_loaded": model_loaded,
        "artifact_path": get_model_path(),
        "version": "1.0.0"
    }

# 2. Single Student Inference Endpoint

@app.post("/api/v1/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_single(student_data: StudentPredictionInput):
    """
    Generate advisory at-risk prediction for an individual student record.
    Predicts if final grade G3 will fall below 10 (Fail) using only pre-outcome data.
    """
    try:
        payload = student_data.model_dump()
        result = predict_student(payload)
        
        # Log to SQLite database for MLOps tracking
        log_prediction(
            course=payload.get("course"),
            g1=payload.get("G1"),
            g2=payload.get("G2"),
            absences=payload.get("absences"),
            failures=payload.get("failures"),
            studytime=payload.get("studytime", 2),
            is_at_risk=1 if result["is_at_risk"] else 0,
            risk_level=result["risk_level"],
            risk_probability=result["risk_probability"],
            human_oversight=result["human_oversight_required"]
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


# 3. Batch Student Inference Endpoints

@app.post("/api/v1/predict/batch", response_model=BatchPredictionResponse, tags=["Inference"])
def predict_batch(batch_data: BatchStudentInput):
    """
    Process multiple students simultaneously (e.g. an entire classroom or cohort).
    """
    try:
        results: List[PredictionResponse] = []
        high_cnt = 0
        mod_cnt = 0
        low_cnt = 0

        for student in batch_data.students:
            payload = student.model_dump()
            res = predict_student(payload)
            results.append(PredictionResponse(**res))
            
            if res["risk_level"] == "High Risk":
                high_cnt += 1
            elif res["risk_level"] == "Moderate Risk":
                mod_cnt += 1
            else:
                low_cnt += 1
            
            log_prediction(
                course=payload.get("course"),
                g1=payload.get("G1"),
                g2=payload.get("G2"),
                absences=payload.get("absences"),
                failures=payload.get("failures"),
                studytime=payload.get("studytime", 2),
                is_at_risk=1 if res["is_at_risk"] else 0,
                risk_level=res["risk_level"],
                risk_probability=res["risk_probability"],
                human_oversight=res["human_oversight_required"]
            )

        return BatchPredictionResponse(
            total_students=len(batch_data.students),
            high_risk_count=high_cnt,
            moderate_risk_count=mod_cnt,
            low_risk_count=low_cnt,
            results=results
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")

@app.post("/api/v1/predict/csv", response_model=BatchPredictionResponse, tags=["Inference"])
async def predict_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file containing student records to generate cohort-level risk predictions.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid .csv file")
    
    try:
        content = await file.read()
        decoded = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(decoded))
        
        students: List[StudentPredictionInput] = []
        for row in reader:
            student_obj = StudentPredictionInput(
                G1=float(row.get("G1", 10)),
                G2=float(row.get("G2", 10)),
                absences=int(row.get("absences", 0)),
                failures=int(row.get("failures", 0)),
                studytime=int(row.get("studytime", 2)),
                traveltime=int(row.get("traveltime", 1)),
                schoolsup=str(row.get("schoolsup", "no")).lower(),
                famsup=str(row.get("famsup", "no")).lower(),
                paid=str(row.get("paid", "no")).lower(),
                activities=str(row.get("activities", "no")).lower(),
                nursery=str(row.get("nursery", "yes")).lower(),
                higher=str(row.get("higher", "yes")).lower(),
                internet=str(row.get("internet", "yes")).lower(),
                romantic=str(row.get("romantic", "no")).lower(),
                famrel=int(row.get("famrel", 4)),
                freetime=int(row.get("freetime", 3)),
                goout=int(row.get("goout", 3)),
                Dalc=int(row.get("Dalc", 1)),
                Walc=int(row.get("Walc", 1)),
                health=int(row.get("health", 3)),
                course=str(row.get("course", "math")).lower()
            )
            students.append(student_obj)

        return predict_batch(BatchStudentInput(students=students))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV records: {str(e)}")


# 4. Model Metadata & Governance Endpoints

@app.get("/api/v1/model/metadata", response_model=ModelMetadataResponse, tags=["Model Governance"])
def model_metadata():
    """
    Returns model lineage, training metrics, features used, and bias mitigation documentation.
    Satisfies acceptance test requirements for architecture walkthrough.
    """
    return get_model_metadata()

# 5. MLOps Monitoring & Logs Endpoints

@app.get("/api/v1/monitoring/logs", tags=["MLOps Monitoring"])
def get_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve recent student prediction logs from SQLite."""
    return get_recent_logs(limit=limit)

@app.get("/api/v1/monitoring/summary", response_model=AnalyticsSummaryResponse, tags=["MLOps Monitoring"])
def analytics_summary():
    """Aggregate statistics on live inference distribution for monitoring drift and risk trends."""
    return get_analytics_summary()
