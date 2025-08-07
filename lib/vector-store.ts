import { AsyncReadStream } from "@mojsoski/async-stream";
import { Embedding, Vector } from "./embedding";

export interface EmbeddingResult<TDocumentReference> extends Embedding {
  distance: number;
  document: TDocumentReference;
}

export default abstract class VectorStore<
  TDocumentReference,
  TDocument extends { id: TDocumentReference }
> {
  abstract query(
    vector: Vector,
    documents?: TDocumentReference[],
    limit?: number,
    offset?: number
  ): AsyncReadStream<EmbeddingResult<TDocumentReference>>;

  abstract append(
    document: TDocumentReference,
    embeddings: AsyncReadStream<Embedding>
  ): Promise<void>;

  abstract delete(document: TDocumentReference): Promise<void>;

  abstract createDocument(
    document: Omit<TDocument, "id">
  ): Promise<TDocumentReference>;
  abstract getDocuments(): AsyncReadStream<TDocument>;
}
