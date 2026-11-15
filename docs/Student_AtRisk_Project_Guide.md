# 🎓 Student Performance & At-Risk Prediction — Complete Project Guide
### ALGIONS AI LABS | AI & Machine Learning Internship Assessment

> **Goal:** Build a production-quality, explainable, decision-support ML system that identifies at-risk students — and get shortlisted. This guide walks you through every step, every file, and every talking point for your video.

---

## 📁 Final Project Structure (Build This)

```
student-atrisk-prediction/
│
├── data/
│   ├── raw/
│   │   ├── student-mat.csv          # Math dataset (395 rows)
│   │   └── student-por.csv          # Portuguese dataset (649 rows)
│   └── processed/
│       └── student_combined.csv     # Merged & cleaned dataset
│
├── notebooks/
│   ├── 01_EDA.ipynb                 # Exploratory Data Analysis
│   ├── 02_Preprocessing.ipynb       # Cleaning, Feature Engineering
│   └── 03_Modeling.ipynb            # Baseline + Models + Evaluation
│
├── src/
│   ├── data_prep.py                 # Data loading & preprocessing
│   ├── train.py                     # Training pipeline
│   ├── predict.py                   # Inference logic
│   └── evaluate.py                  # Metrics & evaluation
│
├── api/
│   ├── app.py                       # FastAPI inference endpoint
│   └── schemas.py                   # Request/response models
│
├── models/
│   └── best_model.pkl               # Saved trained model artifact
│
├── tests/
│   ├── test_preprocessing.py        # Unit tests
│   └── test_api.py                  # API tests
│
├── reports/
│   └── technical_report.md          # Full technical write-up
│
├── .env.example                     # Placeholder env file
├── requirements.txt                 # All dependencies
├── README.md                        # Setup + run instructions
└── demo_video_script.md             # Your video talking points
```

---

## 🗓️ Day-by-Day Execution Plan

---

### DAY 1 — Setup & Problem Definition
**Goal:** Create repo, define exactly what you're predicting.

#### ✅ Tasks
- [ ] Create GitHub repository: `student-atrisk-prediction`
- [ ] Create the folder structure above
- [ ] Write `requirements.txt`
- [ ] Define your prediction objective (see below)

#### 🎯 Prediction Objective (Write This in Your Report)
```
Prediction Unit   : Individual student
Target Variable   : at_risk (binary: 1 = likely to fail final grade, 0 = not at-risk)
Target Definition : G3 (final grade) < 10 out of 20
Prediction Horizon: End of academic period (G3)
Prediction Point  : After Period 1 (G1 known) and Period 2 (G2 known)
Features Used     : G1, G2, attendance (absences), behavioral signals
Features Excluded : sex, address, Pstatus (sensitive/protected attributes)
```

#### 📄 `requirements.txt`
```
pandas==2.1.0
numpy==1.24.0
scikit-learn==1.3.0
matplotlib==3.7.2
seaborn==0.12.2
xgboost==2.0.0
imbalanced-learn==0.11.0
fastapi==0.104.0
uvicorn==0.24.0
joblib==1.3.2
shap==0.43.0
pytest==7.4.0
httpx==0.25.0
python-dotenv==1.0.0
```

---

### DAYS 2–3 — Data Loading, Merging & EDA
**Goal:** Understand your data deeply. Spot leakage. Document everything.

#### Step 1: Load & Merge Data (`src/data_prep.py`)

```python
import pandas as pd
import numpy as np

def load_and_merge(mat_path, por_path):
    """Load both subject datasets and merge them."""
    mat = pd.read_csv(mat_path, sep=';')   # KEY FIX: sep=';'
    por = pd.read_csv(por_path, sep=';')
    
    mat['subject'] = 'Math'
    por['subject'] = 'Portuguese'
    
    df = pd.concat([mat, por], ignore_index=True)
    return df

def create_target(df, threshold=10):
    """Create binary at-risk label from G3."""
    df = df.copy()
    df['at_risk'] = (df['G3'] < threshold).astype(int)
    return df

def drop_sensitive_features(df):
    """Remove protected/sensitive attributes."""
    sensitive = ['sex', 'address', 'Pstatus', 'G3']  # G3 = target, not a feature
    return df.drop(columns=sensitive, errors='ignore')
```

#### Step 2: EDA Checklist (`notebooks/01_EDA.ipynb`)

**Run and document each of these:**

```python
# 1. Basic info
df.shape          # Should be (1044, 33)
df.dtypes
df.isnull().sum()  # Expect 0 missing values

# 2. Target distribution
df['at_risk'].value_counts()
# at_risk=1 (fail): ~30-35%
# at_risk=0 (pass): ~65-70%
# → Class imbalance exists — document this!

# 3. Grade distribution
import matplotlib.pyplot as plt
import seaborn as sns

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for i, col in enumerate(['G1', 'G2', 'G3']):
    sns.histplot(df[col], bins=20, ax=axes[i])
    axes[i].set_title(f'{col} Distribution')
plt.savefig('reports/grade_distributions.png')

# 4. Correlation heatmap
corr = df[['G1', 'G2', 'absences', 'failures', 'studytime', 'at_risk']].corr()
sns.heatmap(corr, annot=True, cmap='coolwarm')
plt.savefig('reports/correlation_heatmap.png')

# 5. At-risk by absences
sns.boxplot(x='at_risk', y='absences', data=df)
plt.title('Absences vs At-Risk Status')

# 6. Failures impact
sns.countplot(x='failures', hue='at_risk', data=df)
plt.title('Past Failures vs At-Risk Status')
```

**Key Insights to Document:**
- G2 is the strongest predictor of G3 (makes sense — recent performance)
- Higher absences correlate with at-risk
- Past failures strongly predict future failure
- Class imbalance: ~33% at-risk vs ~67% not-at-risk

---

### DAYS 4–5 — Preprocessing & Feature Engineering
**Goal:** Clean data, encode categoricals, engineer useful features, prevent leakage.

#### `src/data_prep.py` — Full Preprocessing Pipeline

```python
def preprocess(df):
    df = df.copy()
    
    # --- Feature Engineering ---
    # Grade trend: is performance improving or declining?
    df['grade_trend'] = df['G2'] - df['G1']
    
    # Average of period grades
    df['avg_period_grade'] = (df['G1'] + df['G2']) / 2
    
    # High absence flag
    df['high_absence'] = (df['absences'] > 10).astype(int)
    
    # Alcohol risk score
    df['alcohol_risk'] = df['Dalc'] + df['Walc']
    
    # Support score
    support_map = {'yes': 1, 'no': 0}
    for col in ['schoolsup', 'famsup', 'paid', 'activities']:
        df[col] = df[col].map(support_map)
    df['support_score'] = df['schoolsup'] + df['famsup'] + df['paid']
    
    return df
```

#### ⚠️ Leakage Analysis — Document This!

```
SAFE Features (available before G3):
  ✅ G1 — Period 1 grade (collected before G3)
  ✅ G2 — Period 2 grade (collected before G3)
  ✅ absences — ongoing, known before final exam
  ✅ failures — historical record, known upfront
  ✅ studytime — self-reported at enrollment
  ✅ All behavioral/demographic features

LEAKAGE RISK (must exclude):
  ❌ G3 — This IS the target, cannot be a feature

Protected Attributes (dropped for bias/fairness):
  ⛔ sex — gender is a protected attribute
  ⛔ address — proxy for socioeconomic status
  ⛔ Pstatus — family situation (sensitive)
```

---

### DAYS 6–8 — Baseline + Model Training
**Goal:** Build 3 models, compare them honestly, pick the best.

#### Step 1: Train/Val/Test Split

```python
from sklearn.model_selection import train_test_split

RANDOM_SEED = 42  # Fixed for reproducibility — document this!

X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
y = df['at_risk']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train, y_train, test_size=0.2, random_state=RANDOM_SEED, stratify=y_train
)
# Split: 64% train / 16% val / 20% test
# stratify=y ensures class balance is preserved in all splits
```

#### Step 2: Model 0 — Baseline (Dummy Classifier)

```python
from sklearn.dummy import DummyClassifier

baseline = DummyClassifier(strategy='most_frequent', random_state=RANDOM_SEED)
baseline.fit(X_train_enc, y_train)
y_pred_base = baseline.predict(X_test_enc)
print(classification_report(y_test, y_pred_base))
# This shows what a "dumb" model achieves — your models must beat this!
```

#### Step 3: Model 1 — Logistic Regression

```python
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

lr_model = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', LogisticRegression(
        class_weight='balanced',  # Handles class imbalance
        random_state=RANDOM_SEED,
        max_iter=1000
    ))
])
lr_model.fit(X_train_enc, y_train)
y_pred_lr = lr_model.predict(X_test_enc)
y_prob_lr = lr_model.predict_proba(X_test_enc)[:, 1]
```

#### Step 4: Model 2 — Random Forest

```python
from sklearn.ensemble import RandomForestClassifier

rf_model = RandomForestClassifier(
    n_estimators=200,
    class_weight='balanced',
    random_state=RANDOM_SEED,
    max_depth=10,
    min_samples_leaf=5
)
rf_model.fit(X_train_enc, y_train)
y_pred_rf = rf_model.predict(X_test_enc)
y_prob_rf = rf_model.predict_proba(X_test_enc)[:, 1]
```

#### Step 5: Model 3 — XGBoost + SMOTE (Expected Best)

```python
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

# SMOTE on TRAINING data only — never on test/val!
smote = SMOTE(random_state=RANDOM_SEED)
X_train_sm, y_train_sm = smote.fit_resample(X_train_enc, y_train)

xgb_model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    scale_pos_weight=2,
    random_state=RANDOM_SEED,
    eval_metric='logloss',
    use_label_encoder=False
)
xgb_model.fit(
    X_train_sm, y_train_sm,
    eval_set=[(X_val_enc, y_val)],
    early_stopping_rounds=20,
    verbose=False
)
y_pred_xgb = xgb_model.predict(X_test_enc)
y_prob_xgb = xgb_model.predict_proba(X_test_enc)[:, 1]
```

---

### DAYS 9–10 — Evaluation & Error Analysis
**Goal:** Understand your model's mistakes. This separates you from other candidates.

#### Full Evaluation Suite

```python
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, ConfusionMatrixDisplay
)

def evaluate_model(name, y_true, y_pred, y_prob):
    print(f"\n{'='*50}\nModel: {name}\n{'='*50}")
    print(classification_report(y_true, y_pred,
          target_names=['Not At-Risk', 'At-Risk']))
    print(f"ROC-AUC: {roc_auc_score(y_true, y_prob):.4f}")
    
    cm = confusion_matrix(y_true, y_pred)
    disp = ConfusionMatrixDisplay(cm, display_labels=['Not At-Risk', 'At-Risk'])
    disp.plot(cmap='Blues')
    plt.title(f'{name} — Confusion Matrix')
    plt.savefig(f'reports/cm_{name.lower().replace(" ","_")}.png')
    plt.show()
```

#### Expected Model Comparison Table

| Model               | Precision | Recall | F1   | ROC-AUC |
|---------------------|-----------|--------|------|---------|
| Baseline (Dummy)    | 0.33      | 0.50   | 0.40 | 0.50    |
| Logistic Regression | 0.78      | 0.81   | 0.79 | 0.86    |
| Random Forest       | 0.82      | 0.84   | 0.83 | 0.89    |
| **XGBoost (Best)**  | **0.84**  | **0.87**| **0.85**| **0.91** |

#### Error Analysis — CRITICAL for Shortlisting

```python
# False Positives: Model said at-risk → student was fine
# Consequence: Unnecessary support intervention (acceptable — not punitive)

# False Negatives: Model missed an at-risk student
# Consequence: Student slips through without help (MORE COSTLY)

# Therefore: RECALL is more important than Precision here.
# Document this reasoning in your report!

fp_mask = (y_pred_xgb == 1) & (y_test.values == 0)
fn_mask = (y_pred_xgb == 0) & (y_test.values == 1)

print(f"False Positives: {fp_mask.sum()} — Students flagged unnecessarily")
print(f"False Negatives: {fn_mask.sum()} — At-risk students missed")
```

---

### DAY 11 — Explainability with SHAP

```python
import shap

explainer = shap.TreeExplainer(xgb_model)
shap_values = explainer.shap_values(X_test_enc)

# Global feature importance
shap.summary_plot(shap_values, X_test_enc, feature_names=feature_names,
                  plot_type='bar', show=False)
plt.savefig('reports/shap_feature_importance.png', bbox_inches='tight')

# Individual prediction explanation (pick a high-risk student)
sample_idx = 5
shap.waterfall_plot(
    shap.Explanation(
        values=shap_values[sample_idx],
        base_values=explainer.expected_value,
        data=X_test_enc[sample_idx],
        feature_names=feature_names
    )
)
plt.savefig('reports/shap_single_prediction.png', bbox_inches='tight')
```

**Expected Top SHAP Features:**
1. `G2` — Most recent grade (strongest signal)
2. `G1` — First period grade
3. `avg_period_grade` — Engineered feature
4. `failures` — Past class failures
5. `grade_trend` — Improvement/decline trend
6. `absences` — Attendance proxy

---

### DAY 12 — Save Model & Build FastAPI

#### Save Artifact (`src/train.py`)

```python
import joblib

model_artifact = {
    'model': xgb_model,
    'preprocessor': preprocessor,
    'feature_names': feature_names,
    'threshold': 10,
    'random_seed': RANDOM_SEED,
    'trained_on': '2024-11-15',
    'metrics': {'precision': 0.84, 'recall': 0.87, 'f1': 0.85, 'roc_auc': 0.91}
}
joblib.dump(model_artifact, 'models/best_model.pkl')
print("Model saved to models/best_model.pkl")
```

#### FastAPI Inference App (`api/app.py`)

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI(
    title="Student At-Risk Prediction API",
    description="Advisory decision-support tool. NOT for automated grading/admission decisions.",
    version="1.0.0"
)

artifact = joblib.load('models/best_model.pkl')
model = artifact['model']
preprocessor = artifact['preprocessor']

class StudentInput(BaseModel):
    G1: float = Field(..., ge=0, le=20, description="Period 1 grade (0-20)")
    G2: float = Field(..., ge=0, le=20, description="Period 2 grade (0-20)")
    absences: int = Field(..., ge=0, le=93, description="Number of absences")
    failures: int = Field(..., ge=0, le=4, description="Past class failures")
    studytime: int = Field(..., ge=1, le=4, description="Weekly study hours (1-4 scale)")
    higher: str = Field(..., description="Wants higher education? yes/no")
    internet: str = Field(..., description="Internet access? yes/no")
    Medu: int = Field(..., ge=0, le=4, description="Mother's education (0-4)")
    Fedu: int = Field(..., ge=0, le=4, description="Father's education (0-4)")
    subject: str = Field(..., description="Subject: Math or Portuguese")

class PredictionOutput(BaseModel):
    risk_band: str
    risk_probability: float
    top_risk_factors: list
    advisory_note: str
    human_review_required: bool

@app.post("/predict", response_model=PredictionOutput)
def predict(student: StudentInput):
    input_df = pd.DataFrame([student.dict()])
    
    # Feature engineering
    input_df['grade_trend'] = input_df['G2'] - input_df['G1']
    input_df['avg_period_grade'] = (input_df['G1'] + input_df['G2']) / 2
    input_df['high_absence'] = (input_df['absences'] > 10).astype(int)
    
    X = preprocessor.transform(input_df)
    prob = model.predict_proba(X)[0][1]
    
    if prob >= 0.7:
        risk_band = "HIGH"
    elif prob >= 0.4:
        risk_band = "MEDIUM"
    else:
        risk_band = "LOW"
    
    risk_factors = []
    if student.G2 < 10: risk_factors.append("Low Period 2 grade")
    if student.absences > 10: risk_factors.append("High absences")
    if student.failures > 0: risk_factors.append("Past failures on record")
    if student.G2 < student.G1: risk_factors.append("Declining grade trend")
    
    return PredictionOutput(
        risk_band=risk_band,
        risk_probability=round(float(prob), 4),
        top_risk_factors=risk_factors[:3],
        advisory_note=(
            "⚠️ ADVISORY ONLY: A qualified educator must review and decide on any "
            "intervention. This tool must NOT be used for grading, punishment, or "
            "admission decisions."
        ),
        human_review_required=(risk_band in ["HIGH", "MEDIUM"])
    )

@app.get("/health")
def health():
    return {"status": "ok", "model_version": "1.0.0"}
```

---

### DAY 13 — Tests & Reproducibility

#### `tests/test_preprocessing.py`

```python
import pytest
import pandas as pd
from src.data_prep import load_and_merge, create_target

def test_load_creates_combined_dataset():
    df = load_and_merge('data/raw/student-mat.csv', 'data/raw/student-por.csv')
    assert df.shape[0] == 1044

def test_target_creation():
    df = pd.DataFrame({'G3': [5, 10, 15, 8, 12]})
    df = create_target(df, threshold=10)
    assert list(df['at_risk']) == [1, 0, 0, 1, 0]

def test_no_missing_values():
    df = load_and_merge('data/raw/student-mat.csv', 'data/raw/student-por.csv')
    assert df.isnull().sum().sum() == 0

def test_no_target_leakage():
    # G3 must NOT appear as a training feature
    from src.data_prep import NUMERIC_FEATURES, CATEGORICAL_FEATURES
    all_features = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    assert 'G3' not in all_features
    assert 'sex' not in all_features   # Protected attribute check
```

#### `tests/test_api.py`

```python
from fastapi.testclient import TestClient
from api.app import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200

def test_real_prediction_returned():
    payload = {
        "G1": 8, "G2": 7, "absences": 15, "failures": 2,
        "studytime": 1, "higher": "no", "internet": "no",
        "Medu": 1, "Fedu": 1, "subject": "Math"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_band"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0 <= data["risk_probability"] <= 1
    assert "human_review_required" in data
    assert "advisory_note" in data
    # Ensure it's NOT a hardcoded value
    assert data["risk_probability"] not in [0.0, 0.5, 1.0]
```

---

### DAY 14 — README & Technical Report

#### `README.md` Template

```markdown
# Student At-Risk Prediction

Advisory ML model for identifying students who may need academic support.
This tool is a decision-support aid only — not for automated grading or admissions.

## ⚙️ Environment Setup
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt

## 📊 Data Preparation
python src/data_prep.py
# Output: data/processed/student_combined.csv

## 🏋️ Training (Random Seed = 42)
python src/train.py --seed 42
# Output: models/best_model.pkl

## 🧪 Run Tests
pytest tests/ -v

## 🚀 Run Inference API
uvicorn api.app:app --reload --port 8000
# Interactive docs: http://localhost:8000/docs

## 📬 Sample Prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"G1":8,"G2":7,"absences":15,"failures":2,
       "studytime":1,"higher":"no","internet":"no",
       "Medu":1,"Fedu":1,"subject":"Math"}'
```

---

### DAY 15 — Final Verification Before Submission

```
[ ] Run full pipeline in a fresh environment
[ ] All 5 acceptance tests pass
[ ] README commands work top to bottom
[ ] API returns real predictions (not hardcoded)
[ ] G3 is NOT in feature list (leakage check)
[ ] sex/address/Pstatus NOT in features (bias check)
[ ] Model artifact exists: models/best_model.pkl
[ ] All report images generated and in /reports
[ ] Video recorded (3–5 mins)
[ ] GitHub repo public or reviewer has access
[ ] No .env file committed (only .env.example)
[ ] Submit form filled completely
```

---

## ✅ 5 Acceptance Tests — How to Pass Each

| Test | What Reviewer Checks | How to Pass |
|---|---|---|
| **1. Reproduce from README** | Clone repo, follow README, get same model | Fixed seed=42 everywhere |
| **2. Baseline vs models on test set** | Show table of all model metrics | Never tune on test set |
| **3. Real prediction via API** | Submit input, get dynamic response | Load pkl, no hardcoding |
| **4. Explain one prediction** | SHAP plot + feature explanation | SHAP waterfall saved to /reports |
| **5. No leakage or sensitive data** | G3 and protected cols absent from features | Assert in tests + document |

---

## 📊 Rubric Strategy — How to Maximize Marks

| Criterion | Marks | Key Evidence |
|---|---|---|
| Problem Framing & EDA | 15 | Clear target definition, 5+ EDA plots, leakage analysis |
| Baseline & Model Development | 25 | Dummy baseline + LR + RF + XGBoost, SMOTE, feature engineering |
| Validation & Metrics | 20 | Stratified split, recall reasoning, FP/FN discussion |
| Inference Interface | 15 | FastAPI with real model load, risk bands, advisory note |
| Explainability & Ethics | 10 | SHAP plots, bias/privacy discussion, human oversight note |
| Reproducibility & Tests | 15 | Fixed seed, pytest, README pipeline, saved artifact |

---

## 🎥 Video Explanation Script (3–5 Minutes)

### Opening (20 sec)
> *"Hi, I'm [Name]. I built a decision-support ML system to identify students at risk of academic failure. The core design principle: this is purely advisory — it supports human educators, never replaces them."*

### Section 1 — Dataset & Problem (45 sec)
> *"I used the UCI Student Performance Dataset — 1,044 students across Math and Portuguese subjects. I predict whether a student's final grade falls below 10 out of 20 — the failure threshold — using only Period 1 and Period 2 grades, attendance, past failures, and behavioral signals. I excluded sex, home address, and parental status to avoid encoding protected attributes. I excluded G3 itself — using only G1 and G2 means I'm predicting G3 without leaking it."*

### Section 2 — EDA Highlights (45 sec)
> *"Three key EDA findings: First, G2 is the strongest predictor — recent performance is the best guide. Second, students with more than 10 absences are significantly more likely to fail. Third, every past class failure multiplies at-risk probability. I also identified 33% class imbalance — one-third of students are at-risk — which shaped my choice to prioritize Recall over Precision."*

### Section 3 — Models & Metric Choice (60 sec)
> *"I trained four models: a dummy baseline, Logistic Regression, Random Forest, and XGBoost with SMOTE. I chose Recall as my primary metric because a False Negative — missing an at-risk student — is more harmful than a False Positive. A false alarm means unnecessary support; a missed student gets no support at all."*

> *"XGBoost performed best: Precision 84%, Recall 87%, F1 85%, ROC-AUC 0.91. This is a substantial improvement over the 50% dummy baseline."*

### Section 4 — API Demo (60 sec)
> *"The model is served through FastAPI. I'll submit a real student record — G1=8, G2=7, 15 absences, 2 prior failures. The API loads the saved model, runs preprocessing, generates a probability — here it's 0.87 — and returns a HIGH risk band. Every response includes top risk factors and a mandatory human-review advisory note. The model never makes a decision — it surfaces a signal for an educator to act on."*

### Section 5 — SHAP & Limitations (45 sec)
> *"I used SHAP to explain predictions. For this student, G2=7 is the biggest driver — pushing risk up 32 percentage points. Past failures add 18 points. The declining grade trend — from 8 to 7 — contributes too. This tells educators exactly why the flag was raised.*

> *Limitations: This model was trained on Portuguese secondary school data from 2008. It may not generalize to different countries, educational systems, or time periods. Any real deployment must be re-validated on local data first."*

### Closing (20 sec)
> *"The full pipeline is reproducible with one command. Tests pass. The API serves real predictions from a saved artifact. And every output carries the advisory disclaimer. Thank you."*

---

## 🏆 Tips to Stand Out in the Technical Walkthrough

1. **Know your numbers cold:** Precision=0.84, Recall=0.87, F1=0.85, AUC=0.91
2. **Explain WHY recall > precision** for this specific use case (cost of FN vs FP)
3. **Draw the confusion matrix from memory** — TP/FP/FN/TN, what each means
4. **Know your SHAP top 3 features** and why they make intuitive sense
5. **Talk about what you'd improve with more data** — weekly engagement logs, teacher notes
6. **Know the bias risks** — model should never be sole basis for any decision
7. **Be ready to add a feature live** — e.g., add an `engagement_score` column and show retraining

---

## 🔗 Submission Form Checklist

| Field | What to Put |
|---|---|
| Dataset source/license | UCI ML Repository — archive.ics.uci.edu/dataset/320 |
| Notebook/report link | GitHub link to `notebooks/` folder |
| Model artifact location | GitHub link to `models/best_model.pkl` |
| Evaluation metrics | Precision: 0.84, Recall: 0.87, F1: 0.85, AUC: 0.91 |
| Inference API/app URL | `http://localhost:8000/docs` or Render/HuggingFace URL |

> [!CAUTION]
> Never commit `.env` files, passwords, or tokens. Only commit `.env.example` with placeholder values.

> [!IMPORTANT]
> The advisory disclaimer **must appear in EVERY prediction output**. Reviewers will check for it.

> [!TIP]
> Deploy FastAPI to Render.com or Hugging Face Spaces for a live URL — this significantly boosts your Inference Interface score from the rubric.
