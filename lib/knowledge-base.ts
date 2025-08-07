import { AsyncTransform } from "@mojsoski/async-stream";
import DocumentScanner from "./document-scanner";
import EmbeddingProvider from "./embedding";
import VectorStore from "./vector-store";

export default class KnowledgeBase<
  TVectorStore extends VectorStore<TDocumentReference, TDocument>,
  TDocumentReference,
  TDocument extends { id: TDocumentReference }
> {
  #vectorStore: TVectorStore;
  #embeddingProvider: EmbeddingProvider;
  constructor({
    vectorStore,
    embeddingProvider,
  }: {
    vectorStore: TVectorStore;
    embeddingProvider: EmbeddingProvider;
  }) {
    this.#vectorStore = vectorStore;
    this.#embeddingProvider = embeddingProvider;
  }

  async createDocument<T>(
    info: Omit<TDocument, "id">,
    scanner: DocumentScanner<T>,
    ...sources: T[]
  ) {
    const documentReference = await this.#vectorStore.createDocument(info);
    const embeddings = AsyncTransform.from(sources)
      .flatMap((item) => scanner.scan(item))
      .map((item) => this.#embeddingProvider.create(item));

    await this.#vectorStore.append(documentReference, embeddings);

    return documentReference;
  }

  async query(
    text: string,
    documents?: TDocumentReference[],
    limit?: number,
    offset?: number
  ) {
    const { vector } = await this.#embeddingProvider.create(text);
    return this.#vectorStore.query(vector, documents, limit, offset);
  }
}
