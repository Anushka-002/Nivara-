import os
import threading
import time
import uvicorn
import gradio as gr
from pathlib import Path
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

# 1. Start the FastAPI backend on internal port 8000 in a background daemon thread
def run_fastapi():
    uvicorn.run(fastapi_app, host="127.0.0.1", port=8000, log_level="info")

backend_thread = threading.Thread(target=run_fastapi, daemon=True)
backend_thread.start()

# Give backend a moment to boot
time.sleep(2)

# 2. Build Gradio application on port 7860
# It displays the complete Nivara React App inside an interactive full-height iframe + Direct API Docs explorer
custom_css = """
body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
.gradio-container { max-width: 100% !important; padding: 0 !important; }
iframe { width: 100%; height: 92vh; border: none; }
"""

with gr.Blocks(title="Nivara Healthcare Companion", css=custom_css, theme=gr.themes.Soft()) as demo:
    gr.HTML("""
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 12px 24px; color: white; display: flex; justify-content: space-between; align-items: center; font-family: system-ui, sans-serif;">
        <div>
            <span style="font-size: 20px; font-weight: 700;">❤️ Nivara</span>
            <span style="font-size: 14px; opacity: 0.9; margin-left: 10px;">AI-Powered Independent Living & Safety Companion for Alzheimer's</span>
        </div>
        <div style="font-size: 13px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px;">
            Hugging Face Free Tier • Gradio SDK
        </div>
    </div>
    """)
    
    with gr.Tabs():
        with gr.Tab("👵 Nivara Full Application"):
            # Embeds the unified frontend & interactive portal
            gr.HTML("""
            <iframe src="http://127.0.0.1:8000/" title="Nivara Portal"></iframe>
            """)
            
        with gr.Tab("🤖 AI / RAG Interactive Assistant"):
            gr.Markdown("### Test the Nivara Grounded AI & RAG Companion Directly")
            with gr.Row():
                with gr.Column(scale=2):
                    query_input = gr.Textbox(
                        label="Patient or Caregiver Question",
                        placeholder="e.g., Who is Priya? or Where are my reading glasses?",
                        lines=2
                    )
                    ask_btn = gr.Button("Ask Nivara Grounded AI", variant="primary")
                with gr.Column(scale=3):
                    ans_output = gr.Textbox(label="Nivara Calm Response (Grade-3 Readability)", lines=3)
                    sources_output = gr.JSON(label="Retrieved RAG Sources & Memory Citations")

            def handle_query(q):
                from backend.app.ai.llm_engine import grounded_llm_companion
                res = grounded_llm_companion.answer_patient_query(q)
                return res.get("response", ""), res.get("sources", [])

            ask_btn.click(fn=handle_query, inputs=[query_input], outputs=[ans_output, sources_output])

        with gr.Tab("📋 API & System Health"):
            gr.Markdown("""
            ### Nivara Service Endpoints & Status
            - **Health Check**: `GET /api/health`
            - **Patient Baseline**: Scikit-Learn `IsolationForest`
            - **Vector RAG Memory**: ChromaDB Offline Dense Embeddings
            - **Multi-Role Portals**: Patient, Family Guardian, Nurse, Doctor
            - **Safety Architecture**: Safety events require human verification and never rely solely on an LLM.
            """)

# Launch on port 7860 (Hugging Face default)
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
