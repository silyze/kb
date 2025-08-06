# @silyze/kb

**AI Knowledge Base Interface** – A modular framework for creating, embedding, and querying document-based knowledge bases with pluggable vector stores and embedding providers.

---

## Features

- Document-agnostic knowledge base structure
- Stream-based processing for scalability
- Customizable vector store and embedding provider interfaces
- Async document scanning and embedding
- Query support with filtering and pagination

---

## Installation

```bash
npm install @silyze/kb
```

---

## Quick Start

```ts
import {
  KnowledgeBase,
  VectorStore,
  EmbeddingProvider,
  DocumentScanner,
} from "@silyze/kb";
```

### Create and Use a Knowledge Base

```ts
const kb = new KnowledgeBase({
  vectorStore: myVectorStore,
  embeddingProvider: myEmbeddingProvider,
});

await kb.createDocument(
  { title: "My Document" },
  myDocumentScanner
  /* source items here */
);

const results = kb.query("What is this about?");
for await (const match of results) {
  console.log(match.text, match.distance);
}
```

---

## API Reference

### `KnowledgeBase`

```ts
new KnowledgeBase({ vectorStore, embeddingProvider });
```

#### `createDocument(info, scanner, ...sources)`

- `info`: Metadata for the document (excluding `id`)
- `scanner`: A `DocumentScanner<T>` to extract text chunks
- `sources`: Input data passed to the scanner

Processes the document and stores its embeddings in the vector store.

#### `query(text, documents?, limit?, offset?)`

Performs a semantic search over indexed documents.

---

### `DocumentScanner<T>`

```ts
abstract class DocumentScanner<T> {
  abstract scan(input: T): AsyncReadStream<string>;
}
```

Implement this to extract text chunks from custom document formats.

---

### `EmbeddingProvider`

```ts
abstract class EmbeddingProvider {
  abstract create(text: string): Promise<Embedding>;
}
```

Produces a vector embedding for a given text.

---

### `VectorStore`

```ts
abstract class VectorStore<TDocumentReference, TDocument> {
  query(
    text,
    documents?,
    limit?,
    offset?
  ): AsyncReadStream<EmbeddingResult<TDocumentReference>>;
  append(document, embeddings: AsyncReadStream<Embedding>): Promise<void>;
  delete(document): Promise<void>;
  createDocument(document: Omit<TDocument, "id">): Promise<TDocumentReference>;
  getDocuments(): AsyncReadStream<TDocument>;
}
```

Defines the persistence and search behavior for embeddings and documents.

---

## Types

- `Embedding`: `{ text: string; vector: number[] }`
- `EmbeddingResult<T>`: Extends `Embedding` with `{ distance: number; document: T }`
