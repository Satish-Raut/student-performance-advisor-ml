import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "predictions.db")

def init_db():
    """Create predictions table and index synchronously for ultra-reliable persistence."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS prediction_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            course TEXT,
            g1 REAL,
            g2 REAL,
            absences INTEGER,
            failures INTEGER,
            studytime INTEGER,
            is_at_risk INTEGER,
            risk_level TEXT,
            risk_probability REAL,
            human_oversight_required INTEGER
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON prediction_logs(timestamp)")
    conn.commit()
    conn.close()

def log_prediction(course: str, g1: float, g2: float, absences: int, failures: int, 
                   studytime: int, is_at_risk: int, risk_level: str, risk_probability: float, human_oversight: bool):
    """Log individual prediction for MLOps monitoring and drift tracking."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO prediction_logs 
        (timestamp, course, g1, g2, absences, failures, studytime, is_at_risk, risk_level, risk_probability, human_oversight_required)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.utcnow().isoformat(),
        course,
        g1,
        g2,
        absences,
        failures,
        studytime,
        is_at_risk,
        risk_level,
        risk_probability,
        1 if human_oversight else 0
    ))
    conn.commit()
    conn.close()

def get_recent_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve recent predictions for the frontend dashboard."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM prediction_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def get_analytics_summary() -> Dict[str, Any]:
    """Compute aggregate analytics for MLOps dashboard."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) as count FROM prediction_logs")
    row = cur.fetchone()
    total = row["count"] if row else 0

    if total == 0:
        conn.close()
        return {
            "total_inferences": 0,
            "at_risk_ratio": 0.0,
            "high_risk_total": 0,
            "moderate_risk_total": 0,
            "low_risk_total": 0,
            "course_breakdown": {"math": 0, "portuguese": 0},
            "average_risk_probability": 0.0,
            "recent_trend": []
        }

    cur.execute("""
        SELECT 
            SUM(CASE WHEN risk_level = 'High Risk' THEN 1 ELSE 0 END) as high,
            SUM(CASE WHEN risk_level = 'Moderate Risk' THEN 1 ELSE 0 END) as moderate,
            SUM(CASE WHEN risk_level = 'Low Risk / On Track' THEN 1 ELSE 0 END) as low,
            SUM(CASE WHEN is_at_risk = 1 THEN 1 ELSE 0 END) as at_risk_count,
            AVG(risk_probability) as avg_prob
        FROM prediction_logs
    """)
    stats = cur.fetchone()
    high_count = stats["high"] or 0
    mod_count = stats["moderate"] or 0
    low_count = stats["low"] or 0
    at_risk_count = stats["at_risk_count"] or 0
    avg_prob = stats["avg_prob"] or 0.0

    cur.execute("SELECT course, COUNT(*) as cnt FROM prediction_logs GROUP BY course")
    course_rows = cur.fetchall()
    course_breakdown = {r["course"]: r["cnt"] for r in course_rows if r["course"]}

    cur.execute("""
        SELECT id, timestamp, risk_probability, risk_level, course, g1, g2 
        FROM prediction_logs ORDER BY id DESC LIMIT 10
    """)
    trend_rows = cur.fetchall()
    recent_trend = [dict(r) for r in reversed(trend_rows)]

    conn.close()
    return {
        "total_inferences": total,
        "at_risk_ratio": round(at_risk_count / total, 4),
        "high_risk_total": high_count,
        "moderate_risk_total": mod_count,
        "low_risk_total": low_count,
        "course_breakdown": course_breakdown,
        "average_risk_probability": round(avg_prob, 4),
        "recent_trend": recent_trend
    }
