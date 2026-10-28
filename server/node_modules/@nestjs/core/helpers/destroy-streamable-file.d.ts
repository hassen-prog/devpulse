/**
 * Destroys the stream of a `StreamableFile` that will not be sent. Nothing
 * else would release what the stream reads from (e.g. an open file).
 */
export declare function destroyStreamableFile(value: unknown): void;
