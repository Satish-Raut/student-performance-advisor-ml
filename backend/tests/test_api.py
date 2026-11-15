import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_artifact_loaded" in data

def test_model_metadata():
    response = client.get("/api/v1/model/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "GradientBoosting" in data["algorithm"]
    assert "sex (Gender)" in data["sensitive_features_excluded"]
    assert "G3" not in data["features_used"]

def test_predict_single_high_risk():
    sample_payload = {
        "G1": 6.0,
        "G2": 5.0,
        "absences": 18,
        "failures": 2,
        "studytime": 1,
        "traveltime": 1,
        "schoolsup": "yes",
        "famsup": "no",
        "paid": "no",
        "activities": "no",
        "nursery": "yes",
        "higher": "no",
        "internet": "no",
        "romantic": "yes",
        "famrel": 3,
        "freetime": 4,
        "goout": 4,
        "Dalc": 2,
        "Walc": 3,
        "health": 2,
        "course": "math"
    }
    response = client.post("/api/v1/predict", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_at_risk"] is True
    assert data["risk_level"] in ["High Risk", "Moderate Risk"]
    assert data["risk_probability"] > 0.60
    assert len(data["contributing_factors"]) > 0
    assert data["human_oversight_required"] is True

def test_predict_single_low_risk():
    sample_payload = {
        "G1": 16.0,
        "G2": 17.0,
        "absences": 2,
        "failures": 0,
        "studytime": 3,
        "traveltime": 1,
        "schoolsup": "no",
        "famsup": "yes",
        "paid": "no",
        "activities": "yes",
        "nursery": "yes",
        "higher": "yes",
        "internet": "yes",
        "romantic": "no",
        "famrel": 5,
        "freetime": 2,
        "goout": 2,
        "Dalc": 1,
        "Walc": 1,
        "health": 4,
        "course": "math"
    }
    response = client.post("/api/v1/predict", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_at_risk"] is False
    assert data["risk_level"] == "Low Risk / On Track"
    assert data["risk_probability"] < 0.40

def test_batch_prediction():
    batch_payload = {
        "students": [
            {
                "G1": 6.0, "G2": 5.0, "absences": 15, "failures": 1,
                "studytime": 1, "traveltime": 1, "schoolsup": "no", "famsup": "no",
                "paid": "no", "activities": "no", "nursery": "yes", "higher": "yes",
                "internet": "yes", "romantic": "no", "famrel": 4, "freetime": 3,
                "goout": 3, "Dalc": 1, "Walc": 1, "health": 3, "course": "math"
            },
            {
                "G1": 15.0, "G2": 16.0, "absences": 1, "failures": 0,
                "studytime": 3, "traveltime": 1, "schoolsup": "no", "famsup": "no",
                "paid": "no", "activities": "yes", "nursery": "yes", "higher": "yes",
                "internet": "yes", "romantic": "no", "famrel": 4, "freetime": 3,
                "goout": 2, "Dalc": 1, "Walc": 1, "health": 3, "course": "portuguese"
            }
        ]
    }
    response = client.post("/api/v1/predict/batch", json=batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_students"] == 2
    assert len(data["results"]) == 2

def test_monitoring_analytics():
    response = client.get("/api/v1/monitoring/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_inferences" in data
    assert "course_breakdown" in data
