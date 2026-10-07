export interface SseEvent {
    data: string;
    event: string;
    id: string;
}
export declare function readSseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent>;
export declare function readJsonSse(body: ReadableStream<Uint8Array>, error: (code: string, message: string) => Error): AsyncGenerator<any, void, unknown>;
