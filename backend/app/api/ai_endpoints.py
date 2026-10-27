from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.app.ai.rag_engine import rag_engine
from backend.app.ai.llm_engine import llm_engine

router = APIRouter(prefix="/api/ai", tags=["AI & RAG Engine"])

class RAGQueryRequest(BaseModel):
    query: str
    patient_name: Optional[str] = "Mrs. Sharma"

class RAGQueryResponse(BaseModel):
    spoken_text: str
    retrieved_context: List[Dict[str, Any]]
    model_used: str
    suggested_action: Optional[str] = None
    timestamp: str

class NoteExtractionRequest(BaseModel):
    note_text: str

class DocumentIndexRequest(BaseModel):
    text: str
    category: str
    entity: str
    importance: Optional[str] = "medium"

@router.post("/rag/query", response_model=RAGQueryResponse)
def query_rag_engine(req: RAGQueryRequest):
    """
    Executes a RAG query: retrieves top semantic matches from ChromaDB vector store
    and generates a patient-first compassionate answer.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    result = llm_engine.rag_generate_response(req.query, patient_name=req.patient_name or "Mrs. Sharma")
    return RAGQueryResponse(**result)

@router.post("/extract-note-entities")
def extract_note_entities(req: NoteExtractionRequest):
    """
    GenAI NLP pipeline for extracting structured healthcare entities
    from free-form clinical or family shift notes.
    """
    if not req.note_text.strip():
        raise HTTPException(status_code=400, detail="Note text cannot be empty")
    
    extracted = llm_engine.extract_caregiver_entities(req.note_text)
    return {
        "success": True,
        "input_text": req.note_text,
        "entities": extracted
    }

@router.get("/rag/knowledge-base")
def get_knowledge_base():
    """
    Returns all indexed documents and vector chunks stored in ChromaDB.
    """
    docs = rag_engine.get_all_documents()
    return {
        "collection_name": "nivara_patient_knowledge",
        "total_documents": len(docs),
        "documents": docs
    }

@router.post("/rag/index-document")
def index_new_document(req: DocumentIndexRequest):
    """
    Dynamically indexes a new document or memory into ChromaDB.
    """
    metadata = {
        "category": req.category,
        "entity": req.entity,
        "importance": req.importance or "medium"
    }
    doc_id = rag_engine.add_document(req.text, metadata)
    return {
        "success": True,
        "doc_id": doc_id,
        "message": "Document successfully embedded and indexed in ChromaDB vector store."
    }
