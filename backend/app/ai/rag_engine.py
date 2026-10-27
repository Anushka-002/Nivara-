import os
import zlib
import numpy as np
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings

class OfflineEmbeddingFunction(EmbeddingFunction):
    """
    Guaranteed deterministic offline semantic embedding function.
    Transforms text documents into normalized dense vector representations
    using CRC32 word & bigram hashing. Runs 100% locally with zero internet/HuggingFace dependencies.
    """
    def __init__(self, dim: int = 256):
        self.dim = dim

    def name(self) -> str:
        return "nivara_deterministic_offline_embedder"

    def __call__(self, input: Documents) -> Embeddings:
        embeddings: Embeddings = []
        for text in input:
            vec = np.zeros(self.dim, dtype=np.float32)
            words = text.lower().replace(".", " ").replace(",", " ").replace(":", " ").split()
            # Unigram + bigram hashing
            for i, w in enumerate(words):
                idx = zlib.crc32(w.encode("utf-8")) % self.dim
                vec[idx] += 1.5
                if i < len(words) - 1:
                    bigram = f"{w}_{words[i+1]}"
                    b_idx = zlib.crc32(bigram.encode("utf-8")) % self.dim
                    vec[b_idx] += 2.0
            # Normalize to unit vector for cosine distance
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            embeddings.append(vec.tolist())
        return embeddings

class NivaraRAGEngine:
    """
    RAG (Retrieval-Augmented Generation) Engine for Nivara.
    Uses ChromaDB vector store with deterministic offline embeddings to index
    patient personal memories, caregiver shift notes, medication instructions,
    and daily routines.
    """
    def __init__(self, persist_dir: str = "./chroma_db"):
        self.persist_dir = persist_dir
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.embedding_fn = OfflineEmbeddingFunction(dim=256)
        
        self.collection = self.client.get_or_create_collection(
            name="nivara_patient_knowledge_v3",
            embedding_function=self.embedding_fn,
            metadata={"description": "Patient memories, clinical notes, and routine knowledge"}
        )
        self._ensure_knowledge_seeded()

    def _ensure_knowledge_seeded(self):
        """Pre-seeds the vector store with Mrs. Sharma's knowledge base if empty."""
        if self.collection.count() == 0:
            documents = [
                # Family & Personal Memories
                "Priya Sharma is Mrs. Sharma's loving daughter who lives 10 minutes away. Priya visits every evening with fresh jasmine tea and checks in daily.",
                "Rahul Sharma is Mrs. Sharma's son who lives in Delhi with his children Aarav (age 9) and Maya (age 6). Rahul video calls every Sunday morning.",
                "The ancestral family home is in Jaipur, known for its sunlit courtyard with yellow marigolds, blooming jasmine bushes, and afternoon tea.",
                "Bruno was Mrs. Sharma's beloved golden retriever who loved garden walks and gently resting his chin on her knee while reading.",
                
                # Clinical & Caregiver Shift Notes
                "Nurse Anita Roy visited this morning: Blood pressure measured 124/80 mmHg, heart rate 72 bpm. Morning capsule was taken with breakfast oatmeal. Mrs. Sharma was cheerful and enjoyed a 35-minute stroll.",
                "Priya Sharma evening note: Mother had a restful afternoon. She enjoyed looking at the Jaipur album and reminiscing about yellow marigolds. Dinner was light lentil soup and rice.",
                "Dr. Arvind Mehta's clinical recommendation: Keep evening walking pace gentle. Ensure adequate hydration with warm herbal tea. Review blood pressure during tomorrow's 11:00 AM consultation.",
                
                # Medication & Health Rules
                "Amlodipine Besylate 5mg: Blue morning capsule taken with water immediately after breakfast. Prescribed by Dr. Mehta for blood pressure management.",
                "Calcium with Vitamin D3 Chewable: White tablet to be chewed thoroughly after lunch.",
                "Atorvastatin 10mg: Pink evening pill taken before dinner at 7:00 PM for cholesterol support.",
                
                # Spatial Object Locations
                "Reading glasses (tortoiseshell frame) are kept on the living room coffee table beside the hardcover book.",
                "House and mailbox keys are hanging on the brass hook right next to the front entryway doorway.",
                "Brown leather wallet coin purse is kept in the top drawer of the bedroom nightstand.",
                "Mobile phone with large accessible buttons rests on its charging stand on the side table by the living room armchair.",
                "Weekly medicine pill organizer is kept on the kitchen dining table next to the electric water kettle.",
                
                # Navigation Landmarks
                "Route to Home: From Shanti Park, walk straight along the shaded garden path, pass the green Care Pharmacy sign on your right, and turn right immediately after the pharmacy to reach building number 14 Green Valley."
            ]

            metadatas = [
                {"category": "family_memory", "entity": "Priya", "importance": "high"},
                {"category": "family_memory", "entity": "Rahul", "importance": "high"},
                {"category": "family_memory", "entity": "Jaipur Home", "importance": "medium"},
                {"category": "family_memory", "entity": "Bruno (Dog)", "importance": "high"},
                {"category": "clinical_note", "entity": "Nurse Anita", "importance": "high"},
                {"category": "family_note", "entity": "Priya Visit", "importance": "medium"},
                {"category": "clinical_note", "entity": "Dr. Mehta", "importance": "high"},
                {"category": "medication", "entity": "Blue Morning Capsule", "importance": "high"},
                {"category": "medication", "entity": "White Calcium Chewable", "importance": "medium"},
                {"category": "medication", "entity": "Pink Evening Pill", "importance": "high"},
                {"category": "object_location", "entity": "Reading Glasses", "importance": "high"},
                {"category": "object_location", "entity": "House Keys", "importance": "high"},
                {"category": "object_location", "entity": "Wallet", "importance": "medium"},
                {"category": "object_location", "entity": "Mobile Phone", "importance": "high"},
                {"category": "object_location", "entity": "Pill Organizer", "importance": "high"},
                {"category": "navigation", "entity": "Home Route", "importance": "high"}
            ]

            ids = [f"doc_{i+1}" for i in range(len(documents))]

            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )

    def add_document(self, text: str, metadata: Dict[str, Any], doc_id: Optional[str] = None) -> str:
        """Dynamically indexes a new document into ChromaDB."""
        import uuid
        actual_id = doc_id or f"doc_{uuid.uuid4().hex[:8]}"
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[actual_id]
        )
        return actual_id

    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves the most semantically relevant knowledge chunks from ChromaDB.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k
        )

        retrieved: List[Dict[str, Any]] = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
            distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)
            ids = results["ids"][0] if "ids" in results else [""] * len(docs)

            for d, m, dist, did in zip(docs, metas, distances, ids):
                confidence = max(0.0, min(1.0, 1.0 - (dist / 2.0)))
                retrieved.append({
                    "id": did,
                    "text": d,
                    "metadata": m,
                    "relevance_score": round(confidence, 3)
                })

        return retrieved

    def get_all_documents(self) -> List[Dict[str, Any]]:
        """Returns all documents indexed in the RAG knowledge base for inspection."""
        data = self.collection.get()
        items = []
        if data and "documents" in data and data["documents"]:
            for d, m, i in zip(data["documents"], data["metadatas"], data["ids"]):
                items.append({
                    "id": i,
                    "text": d,
                    "metadata": m
                })
        return items

rag_engine = NivaraRAGEngine()
