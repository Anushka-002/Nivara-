# Nivara — AI-Powered Independent Living & Safety Companion for Alzheimer's / MCI

> **"Help first → Monitor continuously → Detect meaningful changes → Escalate only when necessary."**

Nivara is a patient-first, calm, accessible healthcare assistance platform for people living with Alzheimer's disease or mild cognitive impairment (MCI). Rather than presenting complex medical dashboards to vulnerable patients, Nivara provides gentle, contextual guidance while equipping multi-guardian care networks (family, nurses, doctors) with intelligent, explainable monitoring.

---

## 🌟 Key Architecture & Differentiators

1. **Patient-First Cognitive Interface**:
   - Ultra-minimal design with high contrast, large touch targets, and single-task screens.
   - 4 large primary buttons:
     - 🗓️ **WHAT SHOULD I DO NOW?** (Daily routine assistant)
     - 💊 **MY MEDICINE** (Visual pill cards, simple names, gentle confirmation)
     - 🔎 **HELP ME FIND SOMETHING** (Visual object memory for keys, glasses, wallet, phone)
     - 🆘 **I NEED HELP** (Direct routing: Lost, Medicine, Family, Emergency)
   - 🎤 **TALK TO NIVARA**: Voice-first companion with text-to-speech and intent classification.
   - 🏠 **Help Me Get Home**: Landmark-based cognitive navigation ("Walk straight. You will see the pharmacy. Turn right after the pharmacy.").
   - 📖 **Digital Memory Book & People I Know**: Positive reassurance with familiar photos and 1-tap calling.
   - 🌱 **Today's Independence**: Positive reinforcement celebrating tasks completed independently.

2. **Personal Baseline ML Engine (`scikit-learn`)**:
   - Anomaly detection utilizing `IsolationForest` on multi-dimensional patient routines (walk duration, assistance request rate, medication delay minutes, safe-zone perimeter adherence, sleep schedule variation).
   - Generates non-diagnostic explainability without alarming the patient.

3. **Intelligent Alert Router & Explainable Risk Engine**:
   - **LOW**: Patient-only (gentle on-screen reminder; zero guardian spam).
   - **MEDIUM**: Visiting Nurse Anita (e.g., missed evening medicine check).
   - **HIGH**: Nurse Anita + Primary Family Guardian Priya (e.g., wandering 750m outside safe zone with unanswered prompt).
   - **CRITICAL**: Multi-guardian emergency escalation (Nurse + Family + Doctor/Emergency contact).
   - Full 5-field explainability: *What happened, When, Why flagged, Who notified, Action taken*.

4. **Multi-Role Dashboards**:
   - **Patient View**: Simple, calm, Grade 3 readability.
   - **Family Guardian View (Priya)**: Real-time patient status badge, routine completion %, medication adherence, interactive safe-zone geofence map, daily AI summary (facts, patterns, recommendations), and care team handoff notes.
   - **Doctor Portal (Dr. Mehta)**: Longitudinal 14-day trend analytics (Recharts), baseline comparison matrix, AI clinical observations, underlying safety events, and non-diagnostic regulatory disclaimer.

5. **Viva / Demo Mode (Sections 46 & 47)**:
   - Synthetic patient **Mrs. Sharma (Age 72)** pre-seeded with 14 days of realistic data.
   - 1-Click interactive scenario runner & complete 11-step walkthrough of Section 47.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (with `fastapi`, `uvicorn`, `scikit-learn`, `sqlalchemy`, `pydantic`)
- **Node.js 18+** & **npm**

### 2. Running Backend & Frontend
You can launch both services together using the PowerShell runner:
```powershell
.\run_dev.ps1
```
Or start them individually:

**Backend:**
```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

**Frontend:**
```powershell
cd frontend
npm run dev
```
Open your browser at: [http://localhost:5173](http://localhost:5173)

### 3. Running Unit & Integration Tests
```powershell
python -m pytest backend/tests/test_nivara.py -v
```

---

## 🧪 Demonstration Scenario (Section 47)
Click the **"Simulate Event & Demo"** button in the top navigation to trigger:
- **Step 1–4**: Morning greeting → Medicine reminder → Nurse escalation for unconfirmed dose.
- **Step 5–8**: Movement outside safe zone → Gentle prompt ("Are you trying to go somewhere?") → Family escalation to Priya with live map coordinates.
- **Step 9–10**: Priya acknowledges and verifies patient safety → Timestamped audit log created.
- **Step 11**: Patient returns home → Status automatically restored to Stable Baseline.

---

## ⚖️ Safety & Regulatory Statement
> *Nivara is an assistive behavioral monitoring and cognitive support system. It does not diagnose Alzheimer's disease, replace doctors, nurses, caregivers, emergency services, or medical judgment.*
