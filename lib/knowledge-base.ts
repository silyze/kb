import { AsyncReadStream, AsyncTransform } from "@mojsoski/async-stream";
import DocumentScanner from "./document-scanner";
import EmbeddingProvider from "./embedding";
import VectorStore, { EmbeddingResult } from "./vector-store";

export interface Queryable<TDocumentReference> {
  query(
    text: string,
    limit?: number,
    offset?: number
  ): AsyncReadStream<EmbeddingResult<TDocumentReference>>;
}

export class DocumentReference<
  TDocumentReference,
  TDocument extends { id: TDocumentReference }
> implements Queryable<TDocumentReference>
{
  #vectorStore: VectorStore<TDocumentReference, TDocument>;
  #reference: TDocumentReference;
  #knowledgeBase: KnowledgeBase<TDocumentReference, TDocument>;
  constructor(
    vectorStore: VectorStore<TDocumentReference, TDocument>,
    knowledgeBase: KnowledgeBase<TDocumentReference, TDocument>,
    reference: TDocumentReference
  ) {
    this.#vectorStore = vectorStore;
    this.#reference = reference;
    this.#knowledgeBase = knowledgeBase;
  }

  query(text: string, limit?: number, offset?: number) {
    return this.#knowledgeBase.queryDocuments(
      text,
      [this.#reference],
      limit,
      offset
    );
  }

  get reference() {
    return this.#reference;
  }

  async delete() {
    await this.#vectorStore.delete(this.#reference);
  }
}

export class Document<
  TDocumentReference,
  TDocument extends { id: TDocumentReference }
> extends DocumentReference<TDocumentReference, TDocument> {
  #info: TDocument;
  constructor(
    vectorStore: VectorStore<TDocumentReference, TDocument>,
    knowledgeBase: KnowledgeBase<TDocumentReference, TDocument>,
    document: TDocument
  ) {
    super(vectorStore, knowledgeBase, document.id);
    this.#info = document;
  }

  get info() {
    return this.#info;
  }
}

export default class KnowledgeBase<
  TDocumentReference,
  TDocument extends { id: TDocumentReference }
> implements Queryable<TDocumentReference>
{
  #vectorStore: VectorStore<TDocumentReference, TDocument>;
  #embeddingProvider: EmbeddingProvider;
  constructor({
    vectorStore,
    embeddingProvider,
  }: {
    vectorStore: VectorStore<TDocumentReference, TDocument>;
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

    return new DocumentReference(this.#vectorStore, this, documentReference);
  }

  getDocuments() {
    return this.#vectorStore
      .getDocuments()
      .transform()
      .map((document) => new Document(this.#vectorStore, this, document))
      .stream();
  }

  queryDocuments(
    text: string,
    documents: TDocumentReference[],
    limit?: number,
    offset?: number
  ) {
    return AsyncTransform.from(
      this.#embeddingProvider
        .create(text)
        .then(({ vector }) =>
          this.#vectorStore.query(vector, documents, limit, offset)
        )
    ).stream();
  }

  query(text: string, limit?: number, offset?: number) {
    return AsyncTransform.from(
      this.#embeddingProvider
        .create(text)
        .then(({ vector }) =>
          this.#vectorStore.query(vector, undefined, limit, offset)
        )
    ).stream();
  }
}
