import { IncomingMessage, OutgoingHttpHeaders } from 'http';
import { Transform } from 'stream';
import type { MessageEvent } from '@nestjs/common';
export type AdditionalHeaders = Record<string, string[] | string | number | undefined>;
export type AdditionalHeadersSource = AdditionalHeaders | (() => AdditionalHeaders | undefined);
export type StatusCodeSource = number | (() => number | undefined);
interface ReadHeaders {
    getHeaders?(): AdditionalHeaders;
}
interface WriteHeaders {
    writableEnded?: boolean;
    statusCode?: number;
    writeHead?(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders): void;
    writeHead?(statusCode: number, headers?: OutgoingHttpHeaders): void;
    flushHeaders?(): void;
}
export type WritableHeaderStream = NodeJS.WritableStream & WriteHeaders;
export type HeaderStream = WritableHeaderStream & ReadHeaders;
/**
 * Adapted from https://raw.githubusercontent.com/EventSource/node-ssestream
 * Transforms "messages" to W3C event stream content.
 * See https://html.spec.whatwg.org/multipage/server-sent-events.html
 * A message is an object with one or more of the following properties:
 * - data (String or object, which gets turned into JSON)
 * - type
 * - id
 * - retry
 * - comment
 *
 * If constructed with a HTTP Request, it will optimise the socket for streaming.
 * If this stream is piped to an HTTP Response, it will set appropriate headers.
 */
export declare class SseStream extends Transform {
    private lastEventId;
    private _headersCommitted;
    private _destination;
    private _statusCode;
    private _additionalHeaders;
    private readonly _isHttp2;
    constructor(req?: IncomingMessage);
    get headersCommitted(): boolean;
    pipe<T extends WritableHeaderStream>(destination: T, options?: {
        additionalHeaders?: AdditionalHeadersSource;
        statusCode?: StatusCodeSource;
        end?: boolean;
    }): T;
    /**
     * Writes SSE headers to the destination if they have not been sent yet.
     * The sources are read here, not in `pipe()`, to pick up the values that
     * interceptors and handlers set after piping.
     */
    commitHeaders(): void;
    private readStatusCode;
    private readAdditionalHeaders;
    _transform(message: MessageEvent | string, encoding: string, callback: (error?: Error | null, data?: any) => void): void;
    /**
     * Calls `.write` but handles the drain if needed
     */
    writeMessage(message: MessageEvent, cb: (error: Error | null | undefined) => void): void;
}
export {};
