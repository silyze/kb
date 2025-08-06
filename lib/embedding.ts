export type Vector = number[];

export interface Embedding {
  text: string;
  vector: Vector;
}

export default abstract class EmbeddingProvider {
  abstract create(text: string): Promise<Embedding>;
}
