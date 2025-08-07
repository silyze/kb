import KnowledgeBase, {
  DocumentReference,
  Queryable,
  Document,
} from "./knowledge-base";
import VectorStore, { EmbeddingResult } from "./vector-store";
import DocumentScanner from "./document-scanner";
import EmbeddingProvider, { Embedding, Vector } from "./embedding";

export {
  KnowledgeBase,
  VectorStore,
  Embedding,
  Vector,
  EmbeddingResult,
  DocumentScanner,
  EmbeddingProvider,
  Queryable,
  DocumentReference,
  Document,
};

export default KnowledgeBase;
