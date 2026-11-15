# 🏗️ Student At-Risk Prediction — Project Architecture & Mind Map
### Production-Grade ML System with MLOps

---

## 🛠️ Complete Technology Stack

> Every tool below is chosen for a specific reason. No tool is added for the sake of it — each one solves a real problem in a production ML system.

### 🐍 Core Language

| Tool | Version | Purpose |
|---|---|---|
| **Python** | 3.11 | Primary language for data science, ML, and API development. Industry standard. |

---

### 📦 Data & Processing

| Tool | Version | Purpose |
|---|---|---|
| **pandas** | 2.1.0 | Load, merge, clean, and transform tabular datasets. Used for all data manipulation. |
| **numpy** | 1.24.0 | Numerical operations, array handling, and mathematical computations under the hood. |

---

### 📊 Exploratory Data Analysis (EDA)

| Tool | Version | Purpose |
|---|---|---|
| **matplotlib** | 3.7.2 | Base plotting library. Used for grade distributions, learning curves, and ROC curves. |
| **seaborn** | 0.12.2 | Statistical visualisations — heatmaps, boxplots, countplots for EDA and class imbalance analysis. |

---

### 🤖 Machine Learning

| Tool | Version | Purpose |
|---|---|---|
| **scikit-learn** | 1.3.0 | Core ML library — Logistic Regression, Random Forest, preprocessing pipelines, metrics, train/test split, Dummy Classifier baseline. |
| **XGBoost** | 2.0.0 | Gradient boosted trees — the best-performing model. Handles mixed data, early stopping, and built-in regularisation. |
| **imbalanced-learn** | 0.11.0 | SMOTE (Synthetic Minority Over-sampling Technique) — generates synthetic at-risk samples to fix class imbalance in training data. |

---

### 🔍 Explainability

| Tool | Version | Purpose |
|---|---|---|
| **SHAP** | 0.43.0 | SHapley Additive exPlanations — explains WHY the model predicted a student is at-risk. Generates both global feature importance and individual prediction waterfall charts. Required by the assignment brief. |

---

### ⚡ Inference API

| Tool | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.104.0 | High-performance REST API framework. Serves real-time predictions from the saved model. Auto-generates interactive Swagger UI at `/docs`. |
| **Uvicorn** | 0.24.0 | ASGI server that runs the FastAPI application. Handles incoming HTTP requests. |
| **Pydantic** | (via FastAPI) | Validates all API inputs and outputs using Python type hints. Prevents invalid data from reaching the model. |
| **python-dotenv** | 1.0.0 | Loads environment variables from `.env` file — keeps secrets out of source code. |

---

### 💾 Model Serialisation

| Tool | Version | Purpose |
|---|---|---|
| **joblib** | 1.3.2 | Saves and loads the trained model artifact (`best_model.pkl`). More efficient than pickle for large numpy arrays inside scikit-learn models. |

---

### 🧪 Testing

| Tool | Version | Purpose |
|---|---|---|
| **pytest** | 7.4.0 | Automated test framework. Runs unit tests for preprocessing, leakage checks, and API endpoint validation. |
| **httpx** | 0.25.0 | Async HTTP client used by FastAPI's `TestClient` to test API endpoints without running a live server. |

---

### 🧪 Experiment Tracking & Model Registry *(MLOps Phase)*

| Tool | Version | Purpose |
|---|---|---|
| **MLflow** | 2.8.0 | Logs all experiment parameters, metrics, and artifacts for every model training run. Provides a UI to compare runs. Also acts as a Model Registry — versions, stages (Staging → Production), and lifecycle management. |

---

### 🐳 Containerisation *(MLOps Phase)*

| Tool | Version | Purpose |
|---|---|---|
| **Docker** | Latest | Packages the FastAPI app, model artifact, and all dependencies into a single portable container. Guarantees the app runs identically on any machine or cloud host. |
| **Docker Compose** | Latest | Orchestrates multiple containers together — runs the FastAPI app and MLflow tracking server side by side locally. |

---

### 🔄 CI/CD Pipeline *(MLOps Phase)*

| Tool | Purpose |
|---|---|
| **GitHub** | Source control and remote repository. All code, notebooks, and config are version-controlled here. |
| **GitHub Actions** | Automated CI/CD pipeline — triggers on every push to `main`. Runs tests → builds Docker image → deploys to cloud. Zero manual deployment steps. |

---

### ☁️ Cloud Deployment *(MLOps Phase)*

| Platform | Purpose |
|---|---|
| **Render.com** | Free-tier cloud hosting for Docker containers. Provides a live public URL for the FastAPI app — required for the submission form's inference API/app URL field. |
| **HuggingFace Spaces** | Alternative free hosting option — supports FastAPI and Gradio apps. Good fallback if Render has cold-start issues. |

---

### 📡 Monitoring *(MLOps Phase — Optional but Impressive)*

| Tool | Version | Purpose |
|---|---|---|
| **Evidently AI** | 0.4.0 | Monitors live prediction data for data drift (when incoming student profiles start to differ from training data) and model performance degradation. Triggers retraining alerts. |

---

### 📁 Project & Environment

| Tool | Purpose |
|---|---|
| **Git** | Version control for all source files, notebooks, and configs. |
| **venv / pip** | Python virtual environment and package management. Keeps dependencies isolated per project. |
| **requirements.txt** | Pinned dependency list — ensures anyone who clones the repo gets the exact same package versions. |
| **.env.example** | Placeholder environment file — shows what variables are needed without exposing real values. |
| **Jupyter Notebook** | Interactive development environment for EDA, preprocessing, and model training notebooks. |

---

### 📊 Stack at a Glance

```mermaid
flowchart LR
    subgraph DATA["📦 Data Layer"]
        pandas
        numpy
    end

    subgraph EDA_BOX["🔍 EDA"]
        matplotlib
        seaborn
    end

    subgraph ML_BOX["🤖 ML"]
        scikit-learn
        XGBoost
        SMOTE["imbalanced-learn\nSMOTE"]
        SHAP
    end

    subgraph API_BOX["⚡ API"]
        FastAPI
        Uvicorn
        Pydantic
        joblib
    end

    subgraph TEST_BOX["🧪 Tests"]
        pytest
        httpx
    end

    subgraph MLOPS_BOX["🔁 MLOps"]
        MLflow
        Docker
        GitHub_Actions["GitHub Actions"]
        Render["Render.com"]
        Evidently["Evidently AI"]
    end

    DATA --> EDA_BOX --> ML_BOX --> API_BOX
    API_BOX --> TEST_BOX --> MLOPS_BOX
```

---

## 🧠 Big Picture Mind Map

```mermaid
flowchart TD
    ROOT["🎓 Student At-Risk Prediction\nProduction ML System"]

    ROOT --> A["📦 Phase 1\nData & EDA"]
    ROOT --> B["🤖 Phase 2\nML Pipeline"]
    ROOT --> C["⚡ Phase 3\nFastAPI Inference"]
    ROOT --> D["🔁 Phase 4\nMLOps & DevOps"]

    A --> A1["Raw Data\nUCI Student Dataset"]
    A --> A2["Data Merging\nMath + Portuguese"]
    A --> A3["EDA\nVisualisations + Insights"]
    A --> A4["Leakage Analysis\nFeature Safety Check"]

    B --> B1["Preprocessing\nEncoding + Scaling"]
    B --> B2["Feature Engineering\ngrade_trend, avg_grade..."]
    B --> B3["Model Training\nBaseline → LR → RF → XGB"]
    B --> B4["Evaluation\nPrecision/Recall/F1/AUC"]
    B --> B5["Explainability\nSHAP Values"]

    C --> C1["FastAPI App\nREST Endpoint"]
    C --> C2["Risk Banding\nLOW / MEDIUM / HIGH"]
    C --> C3["Advisory Note\nHuman Review Required"]
    C --> C4["Swagger UI\nInteractive Docs"]

    D --> D1["Experiment Tracking\nMLflow"]
    D --> D2["Model Registry\nMLflow Registry"]
    D --> D3["Containerisation\nDocker"]
    D --> D4["CI/CD Pipeline\nGitHub Actions"]
    D --> D5["Monitoring\nDrift + Performance"]
    D --> D6["Deployment\nRender / HuggingFace"]
```

---

## 📐 Full System Architecture — Layer by Layer

```mermaid
flowchart TD
    subgraph DATA["📦 LAYER 1 — DATA"]
        D1["student-mat.csv\n395 rows"]
        D2["student-por.csv\n649 rows"]
        D3["Merge + sep=semicolon fix\n1044 rows × 33 cols"]
        D4["Create Target\nat_risk = G3 < 10"]
        D1 --> D3
        D2 --> D3
        D3 --> D4
    end

    subgraph EDA["🔍 LAYER 2 — EDA"]
        E1["Grade Distributions\nG1 → G2 → G3"]
        E2["Class Imbalance\n33% at-risk vs 67% not"]
        E3["Correlation Heatmap\nG2 strongest signal"]
        E4["Absence Analysis\n>10 abs = high risk"]
        E5["Failure Impact\nPast failures = future risk"]
        D4 --> E1 & E2 & E3 & E4 & E5
    end

    subgraph ML["🤖 LAYER 3 — ML PIPELINE"]
        M1["Feature Engineering\ngrade_trend, avg_grade,\nhigh_absence, alcohol_risk"]
        M2["Drop Sensitive\nsex, address, Pstatus"]
        M3["Train/Val/Test Split\n64% / 16% / 20%\nstratified + seed=42"]
        M4["SMOTE\nBalance Training Data Only"]
        M5["Baseline\nDummy Classifier"]
        M6["Model 1\nLogistic Regression"]
        M7["Model 2\nRandom Forest"]
        M8["Model 3 ✅ BEST\nXGBoost + SMOTE"]
        M9["Evaluation\nPrecision / Recall / F1\nConfusion Matrix / AUC"]
        M10["SHAP\nExplainability"]
        M11["Save Artifact\nbest_model.pkl"]

        E1 --> M1
        M1 --> M2 --> M3 --> M4
        M3 --> M5 & M6 & M7
        M4 --> M8
        M5 & M6 & M7 & M8 --> M9
        M8 --> M10
        M8 --> M11
    end

    subgraph API["⚡ LAYER 4 — FASTAPI"]
        A1["Load best_model.pkl\nat startup"]
        A2["POST /predict\nStudentInput → PredictionOutput"]
        A3["Risk Band\nLOW / MEDIUM / HIGH"]
        A4["Top Risk Factors\nSHAP-based signals"]
        A5["Advisory Note\nHuman Review Flag"]
        A6["GET /health\nLiveness check"]
        A7["Swagger UI\n/docs endpoint"]

        M11 --> A1
        A1 --> A2
        A2 --> A3 & A4 & A5
        A1 --> A6
        A1 --> A7
    end

    subgraph MLOPS["🔁 LAYER 5 — MLOPS & DEVOPS"]
        O1["MLflow\nExperiment Tracking"]
        O2["MLflow Model Registry\nVersion Control for Models"]
        O3["Docker\nContainerise API"]
        O4["GitHub Actions\nCI/CD Pipeline"]
        O5["Tests\npytest on every push"]
        O6["Deploy\nRender.com / HuggingFace"]
        O7["Monitor\nData Drift + Perf Alerts"]

        M9 --> O1
        O1 --> O2
        A1 --> O3
        O3 --> O4
        O4 --> O5 --> O6
        O6 --> O7
        O7 -->|"Drift Alert"| M1
    end
```

---

## 🗓️ Phase-by-Phase Execution Plan

```mermaid
flowchart LR
    P1["📦 Phase 1\nDAYS 1–3\nData + EDA"]
    P2["🤖 Phase 2\nDAYS 4–8\nML Pipeline"]
    P3["⚡ Phase 3\nDAYS 9–11\nFastAPI"]
    P4["🔁 Phase 4\nDAYS 12–14\nMLOps + DevOps"]
    P5["✅ Phase 5\nDAY 15\nSubmit"]

    P1 --> P2 --> P3 --> P4 --> P5
```

---

## 📦 PHASE 1 — Data & EDA (Days 1–3)

```mermaid
flowchart TD
    S1["📥 Load Data\nread_csv with sep=semicolon"]
    S2["🔗 Merge Datasets\nMath + Portuguese = 1044 rows"]
    S3["🏷️ Define Target\nat_risk = G3 < 10"]
    S4["🔍 Data Profiling\nshape, dtypes, nulls"]
    S5["📊 EDA Plots\n5+ visualisations"]
    S6["⚠️ Leakage Check\nG3 must NOT be a feature"]
    S7["🔒 Sensitive Attr Check\nDrop sex, address, Pstatus"]
    S8["📝 Document Insights\nNote top 5 findings"]

    S1 --> S2 --> S3 --> S4 --> S5
    S5 --> S6 --> S7 --> S8
```

**Key Deliverables:**
- `data/processed/student_combined.csv`
- `notebooks/01_EDA.ipynb` with 5+ plots
- Leakage analysis written in notebook markdown

---

## 🤖 PHASE 2 — ML Pipeline (Days 4–8)

```mermaid
flowchart TD
    P1["🛠️ Feature Engineering\ngrade_trend = G2 - G1\navg_period_grade\nhigh_absence flag\nalcohol_risk score\nsupport_score"]
    P2["🔄 Encode Categoricals\nOneHotEncoder"]
    P3["📏 Scale Numerics\nStandardScaler"]
    P4["✂️ Stratified Split\n64/16/20 with seed=42"]
    P5["⚖️ SMOTE\nOnly on training fold"]
    P6["📉 Baseline\nDummy Most-Frequent"]
    P7["📈 Logistic Regression\nclass_weight=balanced"]
    P8["🌲 Random Forest\nn=200, balanced"]
    P9["🚀 XGBoost\nn=300, early stopping"]
    P10["📊 Compare All Models\nPrecision/Recall/F1/AUC table"]
    P11["🔍 SHAP Analysis\nGlobal + Local explanations"]
    P12["💾 Save Best Model\nbest_model.pkl via joblib"]

    P1 --> P2 --> P3 --> P4 --> P5
    P4 --> P6 & P7 & P8
    P5 --> P9
    P6 & P7 & P8 & P9 --> P10
    P9 --> P11 --> P12
```

**Key Deliverables:**
- `notebooks/02_Preprocessing.ipynb`
- `notebooks/03_Modeling.ipynb`
- `src/data_prep.py`, `src/train.py`, `src/evaluate.py`
- `models/best_model.pkl`
- `reports/` — all plots + confusion matrices

---

## ⚡ PHASE 3 — FastAPI Inference (Days 9–11)

```mermaid
flowchart TD
    FA1["🚀 FastAPI App\napi/app.py"]
    FA2["📥 StudentInput Schema\nG1, G2, absences, failures,\nstudytime, higher, internet,\nMedu, Fedu, subject"]
    FA3["⚙️ Feature Engineering\nSame pipeline as training"]
    FA4["🔮 Model Predict\nLoad pkl → predict_proba"]
    FA5["🎯 Risk Band Logic\nHIGH ≥ 0.70\nMEDIUM 0.40–0.69\nLOW < 0.40"]
    FA6["📤 PredictionOutput\nrisk_band\nrisk_probability\ntop_risk_factors\nadvisory_note\nhuman_review_required"]
    FA7["📋 GET /health\nLiveness probe"]
    FA8["📖 Swagger /docs\nInteractive testing UI"]
    FA9["🧪 pytest Tests\ntest_api.py\ntest_preprocessing.py"]

    FA1 --> FA2 --> FA3 --> FA4 --> FA5 --> FA6
    FA1 --> FA7
    FA1 --> FA8
    FA6 --> FA9
```

**Key Deliverables:**
- `api/app.py` — working FastAPI
- `api/schemas.py` — Pydantic models
- `tests/test_api.py`
- Swagger UI accessible at `/docs`

---

## 🔁 PHASE 4 — MLOps & DevOps (Days 12–14)

> This is what elevates your project from student assignment to production-grade system.

```mermaid
flowchart TD
    subgraph TRACK["🧪 Experiment Tracking"]
        T1["MLflow\nmlflow.log_params\nmlflow.log_metrics\nmlflow.sklearn.log_model"]
        T2["Track All 4 Models\nparams + metrics + artifacts"]
        T3["Compare Runs\nMLflow UI at localhost:5000"]
    end

    subgraph REGISTRY["📦 Model Registry"]
        R1["Register Best Model\nmlflow.register_model"]
        R2["Staging → Production\nModel Lifecycle Stages"]
        R3["Version Control\nModel v1, v2, v3..."]
    end

    subgraph CONTAINER["🐳 Docker"]
        D1["Dockerfile\nPython 3.11 + requirements"]
        D2["docker build\nCreate image"]
        D3["docker run -p 8000:8000\nRun container locally"]
        D4["docker-compose.yml\nAPI + MLflow together"]
    end

    subgraph CICD["🔄 GitHub Actions CI/CD"]
        G1["On Push to main\nTrigger workflow"]
        G2["Install Dependencies\npip install -r requirements.txt"]
        G3["Run Tests\npytest tests/ -v"]
        G4["Build Docker Image\ndocker build"]
        G5["Deploy to Render\nor HuggingFace Spaces"]
    end

    subgraph MONITOR["📡 Monitoring"]
        M1["Log Predictions\nStore inputs + outputs"]
        M2["Data Drift Detection\nCompare live vs training dist"]
        M3["Performance Alerts\nF1 drops below threshold"]
        M4["Retraining Trigger\nWhen drift detected"]
    end

    TRACK --> REGISTRY --> CONTAINER --> CICD --> MONITOR
    MONITOR -->|"Drift Alert"| TRACK
```

### MLOps Tools Stack

| Tool | Purpose | When |
|---|---|---|
| **MLflow** | Experiment tracking + model registry | Day 12 |
| **Docker** | Containerise FastAPI app | Day 13 |
| **GitHub Actions** | CI/CD — test + build + deploy on push | Day 13 |
| **pytest** | Automated tests in CI pipeline | Day 13 |
| **Render.com** | Free cloud deployment of Docker container | Day 14 |
| **Evidently AI** | Data drift monitoring (optional but impressive) | Day 14 |

---

## 🐳 Docker Architecture

```mermaid
flowchart LR
    DEV["💻 Developer\nLocal Machine"]
    CODE["📁 Source Code\napi/ + models/ + src/"]
    IMG["🐳 Docker Image\nPython + FastAPI + Model"]
    CON["📦 Docker Container\nRunning on port 8000"]
    CLOUD["☁️ Cloud Host\nRender.com or HuggingFace"]

    DEV --> CODE
    CODE -->|"docker build"| IMG
    IMG -->|"docker run"| CON
    CON -->|"push + deploy"| CLOUD
```

**Dockerfile (what it will look like):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🔄 GitHub Actions CI/CD Flow

```mermaid
flowchart TD
    GH["👨‍💻 Git Push\nto main branch"]
    T1["⚙️ Trigger\n.github/workflows/ci.yml"]
    T2["📦 Setup Python\ninstall dependencies"]
    T3["🧪 Run Tests\npytest tests/ -v"]
    T4{"✅ Tests Pass?"}
    T5["🐳 Build Docker Image"]
    T6["🚀 Deploy to Render"]
    T7["❌ Notify Failure\nDo NOT deploy"]

    GH --> T1 --> T2 --> T3 --> T4
    T4 -->|"Yes"| T5 --> T6
    T4 -->|"No"| T7
```

---

## 📡 MLflow Experiment Tracking Flow

```mermaid
flowchart TD
    EX["mlflow.start_run"]
    P["Log Parameters\nn_estimators, learning_rate,\nrandom_seed, smote=True"]
    M["Log Metrics\nprecision, recall, f1, roc_auc\nper model per run"]
    A["Log Artifacts\nbest_model.pkl\nSHAP plots\nconfusion matrix"]
    R["Register Model\nmlflow.register_model"]
    S["Promote to Production\nStaging → Production"]

    EX --> P --> M --> A --> R --> S
```

---

## 🗂️ Complete Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | Python 3.11 | Industry standard for ML |
| **Data** | pandas, numpy | Data manipulation |
| **EDA** | matplotlib, seaborn | Visualisations |
| **ML Models** | scikit-learn, XGBoost | Proven algorithms |
| **Imbalance** | imbalanced-learn (SMOTE) | Class imbalance handling |
| **Explainability** | SHAP | Feature importance |
| **API** | FastAPI + Uvicorn | High-performance REST API |
| **Validation** | Pydantic | Input/output schema |
| **Model Saving** | joblib | Artifact serialisation |
| **Experiment Tracking** | MLflow | Track all runs + metrics |
| **Containerisation** | Docker | Reproducible deployment |
| **CI/CD** | GitHub Actions | Automated test + deploy |
| **Cloud Deployment** | Render.com | Free tier hosting |
| **Monitoring** | Evidently AI | Drift detection |
| **Testing** | pytest, httpx | Automated test suite |
| **Version Control** | Git + GitHub | Source control |

---

## 🔀 Data Flow — End to End

```mermaid
flowchart LR
    RAW["📥 Raw CSV\nstudent-mat.csv\nstudent-por.csv"]
    CLEAN["🧹 Cleaned Data\n1044 rows\n0 missing values"]
    FEAT["⚙️ Feature Engineered\ngrade_trend\navg_period_grade\nhigh_absence\nalcohol_risk"]
    SPLIT["✂️ Split\nTrain 64%\nVal 16%\nTest 20%"]
    TRAIN["🏋️ Train\nXGBoost + SMOTE"]
    EVAL["📊 Evaluate\nTest set only\nPrecision/Recall/F1"]
    SAVE["💾 Artifact\nbest_model.pkl"]
    SERVE["🌐 FastAPI\nPOST /predict"]
    OUT["📤 Output\nRisk Band\nProbability\nTop Factors\nAdvisory Note"]

    RAW --> CLEAN --> FEAT --> SPLIT --> TRAIN --> EVAL --> SAVE --> SERVE --> OUT
```

---

## ✅ What Makes This Production-Grade?

| Feature | Basic Project | Your Project ✅ |
|---|---|---|
| Fixed random seed | Maybe | ✅ seed=42 everywhere |
| Train/val/test split | Train/test only | ✅ 3-way stratified split |
| Leakage prevention | Not checked | ✅ Explicitly tested |
| Class imbalance handling | Ignored | ✅ SMOTE + class_weight |
| Model explainability | None | ✅ SHAP global + local |
| Ethical safeguards | None | ✅ Advisory note + bias checks |
| REST API | None | ✅ FastAPI with Pydantic |
| Automated tests | None | ✅ pytest suite |
| Experiment tracking | None | ✅ MLflow runs |
| Containerisation | None | ✅ Docker |
| CI/CD | None | ✅ GitHub Actions |
| Cloud deployment | None | ✅ Render.com |
| Drift monitoring | None | ✅ Evidently AI |

---

## 🎯 Recommended Build Order

```
STEP 1  →  Data loading + merging (fix sep=';')
STEP 2  →  EDA notebook (5+ plots, document insights)
STEP 3  →  Leakage + sensitive feature analysis
STEP 4  →  Feature engineering
STEP 5  →  Preprocessing pipeline (ColumnTransformer)
STEP 6  →  Baseline model
STEP 7  →  LR + RF + XGBoost training
STEP 8  →  Evaluation table (all 4 models vs test set)
STEP 9  →  SHAP explainability
STEP 10 →  Save best_model.pkl
STEP 11 →  FastAPI app (POST /predict endpoint)
STEP 12 →  pytest test suite
STEP 13 →  MLflow experiment tracking
STEP 14 →  Dockerfile + docker-compose
STEP 15 →  GitHub Actions CI/CD workflow
STEP 16 →  Deploy to Render.com
STEP 17 →  (Optional) Evidently AI drift monitoring
STEP 18 →  README, technical report, demo video
STEP 19 →  Final verification checklist
STEP 20 →  Submit!
```

---

> **When you are ready to build any step, just say:**
> *"Start Step 3"* or *"Build the FastAPI"* or *"Set up MLflow"*
> and I will generate the full code for that exact step.
