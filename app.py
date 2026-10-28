import os
import gradio as gr
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.main import app as fastapi_app

# Dummy spaces decorator to satisfy Hugging Face ZeroGPU runtime check
try:
    import spaces
    @spaces.GPU
    def _zero_gpu_init():
        return True
    try:
        _zero_gpu_init()
    except Exception:
        pass
except ImportError:
    pass

# Mount frontend/dist directly onto fastapi_app
frontend_dist = Path(__file__).resolve().parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    fastapi_app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @fastapi_app.get("/portal")
    @fastapi_app.get("/portal/{full_path:path}")
    async def serve_portal(full_path: str = ""):
        file_path = frontend_dist / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

custom_css = """
body, html { margin: 0; padding: 0; height: 100%; }
.gradio-container { max-width: 100% !important; padding: 8px !important; }
iframe { width: 100%; height: 85vh; border: none; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
"""

with gr.Blocks(title="Nivara Healthcare Companion", css=custom_css, theme=gr.themes.Soft()) as demo:
    gr.HTML("""
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 14px 20px; color: white; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-family: system-ui, sans-serif; margin-bottom: 12px;">
        <div>
            <span style="font-size: 22px; font-weight: 700;">❤️ Nivara</span>
            <span style="font-size: 14px; opacity: 0.95; margin-left: 12px;">AI-Powered Independent Living & Safety Companion for Alzheimer's / MCI</span>
        </div>
        <div style="font-size: 13px; background: rgba(255,255,255,0.25); padding: 4px 14px; border-radius: 9999px;">
            Hugging Face Live
        </div>
    </div>
    """)

    with gr.Tabs():
        with gr.Tab("👵 Nivara Interactive Portal"):
            gr.HTML("""
            <div style="margin-bottom: 8px; font-size: 14px; color: #475569;">
                <b>Multi-Role Healthcare Interface:</b> Switch between 👵 <i>Patient</i>, 👩 <i>Family Guardian</i>, 👩‍⚕️ <i>Nurse</i>, and 👨‍⚕️ <i>Doctor</i> views inside the companion below.
            </div>
            <iframe src="/portal" title="Nivara Portal"></iframe>
            """)

        with gr.Tab("🤖 Grounded GenAI & RAG Assistant"):
            gr.Markdown("""
            ### Grounded Patient Companion (Grade-3 Readability & Zero-Hallucination)
            Ask any question regarding Mrs. Sharma's routine, medications, or trusted people.
            """)
            with gr.Row():
                with gr.Column(scale=2):
                    query_input = gr.Textbox(
                        label="Question / Voice Prompt",
                        placeholder="e.g. Who is Priya? or Where are my reading glasses?",
                        lines=2
                    )
                    ask_btn = gr.Button("Ask Nivara AI Companion", variant="primary")
                with gr.Column(scale=3):
                    ans_output = gr.Textbox(label="Nivara Calm Response", lines=3)
                    sources_output = gr.JSON(label="Retrieved RAG Sources & Memory Citations")

            def handle_query(q):
                if not q.strip():
                    return "Please type a question to ask Nivara.", []
                from backend.app.ai.llm_engine import grounded_llm_companion
                res = grounded_llm_companion.answer_patient_query(q)
                return res.get("response", ""), res.get("sources", [])

            ask_btn.click(fn=handle_query, inputs=[query_input], outputs=[ans_output, sources_output])

        with gr.Tab("📋 System & Clinical Baseline"):
            gr.Markdown("""
            ### Nivara System Architecture & Clinical Guardrails
            - **ML Anomaly Detection**: Scikit-Learn `IsolationForest` continuously calculates routine baseline deviations.
            - **4-Tier Risk Escalation**: Deterministic scoring (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with 5-point explanations.
            - **RAG Vector Memory**: ChromaDB semantic knowledge base indexing patient memories and object positions.
            - **Safety Guarantee**: Critical safety alerts never rely on autonomous LLMs; all medical interventions require human confirmation.
            - **Direct API Health**: `GET /api/health`
            """)

# Mount Gradio demo onto FastAPI app root or launch directly
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=7860, reload=False)
