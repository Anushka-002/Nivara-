# Nivara — AI-Powered Independent Living & Safety Companion for Alzheimer's / MCI

> **"Helping people with Alzheimer's live more independently, safely, and confidently."**  
> *Help first → Monitor continuously → Detect meaningful changes → Escalate only when necessary.*

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-orange.svg)](https://www.trychroma.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E.svg)](https://scikit-learn.org/)

---

## 📖 Product Mission & Core Philosophy

Nivara is an **assistive healthcare technology platform** designed for people living with Alzheimer's disease or mild cognitive impairment (MCI) and their trusted care network.

The central philosophy is:
> **"Help the person live independently, not make them feel monitored."**

### 4 Core Architectural Principles:
1. **Independence**: Always try to help the patient solve a problem themselves before involving anyone else.
2. **Safety**: Important safety decisions **never depend entirely on an LLM**.
3. **Simplicity**: Patient interface has Grade-3 readability, high contrast, large touch targets, and single-task screens.
4. **Human Connection**: Strengthens the relationship between the patient and their trusted family, nurses, and doctors.

```text
PATIENT NEED
     ↓
Nivara Understands (Speech / NLP / Intent)
     ↓
Try to Help the Patient (RAG Memory / Guidance / Landmarks)
     ↓
Check Whether Issue is Resolved
     ↓
If Necessary → Intelligently Escalate to Right Person (Rules + ML)
     ↓
Human Caregiver Verifies & Decides
```

---

## 🌟 Complete Feature Map (Implemented in Repository)

### 👵 1. Patient Experience 
- **Minimal Home Screen**:
  - `Good Morning ❤️`
  - `What would you like to do?`
  - **NOW / NEXT / LATER** Paradigm (Section 4):
    - `NOW`: ☀️ Have breakfast
    - `NEXT`: 💊 Medicine at 9:00 AM
    - `LATER`: ❤️ Priya is visiting at 4:00 PM
- **Universal "🤔 I FORGOT SOMETHING" Mode** (Section 11):
  - 1-Tap cognitive recall connecting routine, appointments, family memories, object memory, and caregiver notes.
- **5 Primary Large Touch Action Buttons**:
  - `[ MY DAY ]`: Step-by-step daily rhythm with positive completion reinforcement.
  - `[ MY MEDICINE ]`: Visual colors (Blue, White, Pink), schedules, and explicit **Medication reminder sent** vs **Medication confirmed** distinction.
  - `[ FIND SOMETHING ]`: OpenCV computer vision spatial memory for reading glasses, keys, wallet, phone.
  - `[ MY PEOPLE ]`: 1-Tap direct calls to Priya (Daughter), Rahul (Son), Anita (Nurse), Dr. Mehta (Doctor).
  - `[ GET HELP ]`: Reassuring distress mode (*"❤️ You are safe. You are currently in your home."*).
- **🎤 TALK TO NIVARA**: Voice-first companion with text-to-speech (`speechSynthesis`) and intent classification.
- **Daily Memory / AI Journal** (Section 13): Traceable, verified end-of-day summary of completed activities.
- **Help Me Get Home** (Section 10): Cognitive landmark navigation (*"Walk straight. You will see the pharmacy. Turn right after the pharmacy."*).
- **Digital Memory Book** (Section 23): Reassuring family photos, Jaipur ancestral home, Bruno the golden retriever.
- **Gentle Cognitive Activity** (Section 28): Pair matching with zero fail states (*"Nice try! Would you like to try again?"*).

---

### 🛡️ 2. Intelligent Safety Engine & Multi-Guardian Network
- **Architectural Safety Rule** (Section 18):
  ```text
  Event → Rules + ML → Risk Priority → Patient Assistance → Alert Engine → Human
  ```
  The LLM explains the event, but human caregivers make safety and clinical decisions.
- **Intelligent Alert Routing Matrix**:
  - `LOW`: Patient on-screen gentle prompt only (zero guardian notification fatigue).
  - `MEDIUM`: Visiting Nurse Anita Roy (e.g. unconfirmed evening medicine).
  - `HIGH`: Nurse Anita + Primary Family Guardian Priya (e.g. 750m departure outside safe perimeter).
  - `CRITICAL`: Immediate emergency alert to Nurse, Family, and Emergency Contacts.
- **5-Point Alert Explainability** (Sections 31 & 32):
  Every alert details: **WHAT** happened, **WHEN**, **WHY** flagged, **WHO** notified, and **ACTION TAKEN**.
- **Interactive Safe Zone Map**:
  - Geofences: Home (150m), Shanti Park (220m), Care Pharmacy (90m), Dr. Mehta's Clinic (120m).
  - Real-time patient coordinates and out-of-bounds breadcrumb tracking.
- **Caregiver Handoff Notes** (Section 22):
  Shift handoff communication between visiting nurses and family members.

---

### 👨‍⚕️ 3. Clinical Doctor Portal 
- **14-Day Longitudinal Analytics (Recharts)**:
  - Routine Adherence % vs Medication Confirmation % vs Confusion Assistance Inquiries.
- **Baseline Deviation Matrix**:
  - Tracks statistical shifts from established individual baseline (mean ± std).
- **AI Clinical Observations**:
  - Synthesizes multi-day trends without medical jargon or grading disease progression.
- **Mandatory Healthcare Disclaimer**:
  > *"Nivara is an assistive behavioral monitoring system. It does not provide medical diagnoses, disease progression grading, or medical prescriptions."*

---

### 🤖 4. AI, Machine Learning, RAG & Computer Vision 
- **ChromaDB Vector Store RAG (`backend/app/ai/rag_engine.py`)**:
  - Indexes approved family memories, clinical notes, medications, and spatial object locations.
  - Runs with a deterministic offline dense vector embedding engine (`OfflineEmbeddingFunction`) with zero internet/HuggingFace download dependencies.
- **Grounded GenAI LLM Companion (`backend/app/ai/llm_engine.py`)**:
  - Answers personal questions with strict factual grounding. If unknown: *"I don't have that information yet, but I can connect you with your family."*
  - Caregiver Note NLP Entity Extractor: parses free-form text into structured clinical indicators (`blood_pressure`, `heart_rate`, `patient_mood`, `dietary_items_noted`, `medication_status`).
- **Scikit-Learn Personal Baseline Engine (`backend/app/ml/baseline_engine.py`)**:
  - `IsolationForest` anomaly detector evaluating multidimensional patient routine vectors.
- **OpenCV Object Memory Scanner (`backend/app/cv/object_detector.py`)**:
  - Edge density and color histogram feature mapping for spatial object tracking.

---

## 🧪 5. Built-in Viva Demonstration Scenarios

Click **"Simulate Event & Demo"** in the top navigation bar to trigger:

### A. Dedicated AI & RAG Scenarios 1–5 (Sections 36–40):
1. **Scenario 1 — GenAI + RAG**: Patient asks *"Who is Priya?"* → ChromaDB retrieves approved memory → Generates: *"Priya is your daughter. She usually visits you on Sundays."*
2. **Scenario 2 — Daily Guidance**: Patient asks *"What should I do now?"* → Generates contextual NOW / NEXT / LATER guidance.
3. **Scenario 3 — Safety Escalation**: Simulates departure from safe zone → Gentle prompt sent to patient → No response → Primary guardian Priya alerted with map coordinates.
4. **Scenario 4 — Object Finding**: Patient asks *"Where are my glasses?"* → Visual memory responds: *"I last saw your glasses on the living-room coffee table beside the book."*
5. **Scenario 5 — Caregiver AI Summary**: Traceable end-of-day summary where every fact is verifiable against database events.

### B. 11-Step Full Walkthrough (Section 47):
- Step-by-step interactive stepper with Previous/Next controls demonstrating the entire morning wake-up → medication prompt → safe zone breach → guardian call → safe return flow.

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Quick Launch (Both Servers)
```powershell
Set-Location "C:\Users\Dell\.gemini\antigravity\scratch\nivara"
.\run_dev.ps1
```
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Run Unit & Integration Tests (13/13 Passing)
```powershell
Set-Location "C:\Users\Dell\.gemini\antigravity\scratch\nivara"
python -m pytest backend/tests/test_nivara.py -v
```

---

## 🔒 Security & Privacy 
- **Principle**: *Collect less → protect what you collect → show only what someone is authorized to see.*
- Role-Based Access Control (Patient, Family, Nurse, Doctor, Emergency Contact).
- Audit logging for all sensitive data access and alert acknowledgments.
- Transparent consent management (*"Who can see my information?"*).
- Environment variable isolation (`.env.example`).
