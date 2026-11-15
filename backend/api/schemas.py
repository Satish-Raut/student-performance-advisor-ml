from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# 1. Single Student Prediction Schema

class StudentPredictionInput(BaseModel):
    G1: float = Field(..., ge=0, le=20, description="First period grade (0 to 20)")
    G2: float = Field(..., ge=0, le=20, description="Second period grade (0 to 20)")
    absences: int = Field(..., ge=0, le=93, description="Number of school absences")
    failures: int = Field(..., ge=0, le=4, description="Number of past class failures")
    studytime: int = Field(2, ge=1, le=4, description="Weekly study time (1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h)")
    traveltime: int = Field(1, ge=1, le=4, description="Home to school travel time (1: <15m, 2: 15-30m, 3: 30m-1h, 4: >1h)")
    schoolsup: str = Field("no", pattern="^(yes|no)$", description="Extra educational support")
    famsup: str = Field("no", pattern="^(yes|no)$", description="Family educational support")
    paid: str = Field("no", pattern="^(yes|no)$", description="Extra paid classes within course")
    activities: str = Field("no", pattern="^(yes|no)$", description="Extra-curricular activities")
    nursery: str = Field("yes", pattern="^(yes|no)$", description="Attended nursery school")
    higher: str = Field("yes", pattern="^(yes|no)$", description="Wants to take higher education")
    internet: str = Field("yes", pattern="^(yes|no)$", description="Internet access at home")
    romantic: str = Field("no", pattern="^(yes|no)$", description="In a romantic relationship")
    famrel: int = Field(4, ge=1, le=5, description="Quality of family relationships (1: very bad to 5: excellent)")
    freetime: int = Field(3, ge=1, le=5, description="Free time after school (1: very low to 5: very high)")
    goout: int = Field(3, ge=1, le=5, description="Going out with friends (1: very low to 5: very high)")
    Dalc: int = Field(1, ge=1, le=5, description="Workday alcohol consumption (1: very low to 5: very high)")
    Walc: int = Field(1, ge=1, le=5, description="Weekend alcohol consumption (1: very low to 5: very high)")
    health: int = Field(3, ge=1, le=5, description="Current health status (1: very bad to 5: very good)")
    course: str = Field("math", pattern="^(math|portuguese)$", description="Course subject major")

    class Config:
        json_schema_extra = {
            "example": {
                "G1": 8.0,
                "G2": 7.0,
                "absences": 12,
                "failures": 1,
                "studytime": 2,
                "traveltime": 1,
                "schoolsup": "yes",
                "famsup": "no",
                "paid": "no",
                "activities": "yes",
                "nursery": "yes",
                "higher": "yes",
                "internet": "yes",
                "romantic": "no",
                "famrel": 4,
                "freetime": 3,
                "goout": 2,
                "Dalc": 1,
                "Walc": 1,
                "health": 3,
                "course": "math"
            }
        }


# 2. Prediction Output Schema

class PredictionResponse(BaseModel):
    is_at_risk: bool
    risk_level: str
    risk_probability: float
    confidence_percentage: str
    contributing_factors: List[str]
    recommended_interventions: List[str]
    feature_impacts: Dict[str, float]
    advisory_disclaimer: str
    human_oversight_required: bool


# 3. Batch Prediction Schemas

class BatchStudentInput(BaseModel):
    students: List[StudentPredictionInput]

class BatchPredictionResponse(BaseModel):
    total_students: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    results: List[PredictionResponse]


# 4. Model Metadata & Performance Schemas

class ModelMetadataResponse(BaseModel):
    model_name: str
    model_version: str
    algorithm: str
    target_definition: str
    features_used: List[str]
    sensitive_features_excluded: List[str]
    trained_date: str
    performance_metrics: Dict[str, Any]
    confusion_matrix: List[List[int]]


# 5. MLOps Analytics & Dashboard Stats

class AnalyticsSummaryResponse(BaseModel):
    total_inferences: int
    at_risk_ratio: float
    high_risk_total: int
    moderate_risk_total: int
    low_risk_total: int
    course_breakdown: Dict[str, int]
    average_risk_probability: float
    recent_trend: List[Dict[str, Any]]
