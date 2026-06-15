import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


_MODEL_INSTANCE = None


class VectorSearchService:
    """
    Service for generating vector embeddings and performing semantic search and document ranking.
    """

    def __init__(self) -> None:
        global _MODEL_INSTANCE
        if _MODEL_INSTANCE is None:
            # Load standard lightweight SentenceTransformer model once
            _MODEL_INSTANCE = SentenceTransformer("all-MiniLM-L6-v2")
        self.model = _MODEL_INSTANCE

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for a given text.
        """
        return self.model.encode(text).tolist()

    def rank_documents(self, query: str, documents: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Rank a set of documents based on semantic similarity to a query.
        Each document dict must contain a 'text' key.
        """
        if not documents:
            return []

        # Generate embeddings
        query_embedding = self.model.encode([query])
        doc_texts = [doc["text"] for doc in documents]
        doc_embeddings = self.model.encode(doc_texts)

        # Compute cosine similarities
        similarities = cosine_similarity(query_embedding, doc_embeddings)[0]

        ranked_docs = []
        for idx, score in enumerate(similarities):
            doc = documents[idx].copy()
            doc["score"] = float(score)
            ranked_docs.append(doc)

        # Sort descending by score
        ranked_docs.sort(key=lambda x: x["score"], reverse=True)
        return ranked_docs[:top_k]
