import { AsyncReadStream } from "@mojsoski/async-stream";

export default abstract class DocumentScanner<T> {
  abstract scan(input: T): AsyncReadStream<string>;
}
