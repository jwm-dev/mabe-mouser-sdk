"use strict";
// SSE framing follows https://html.spec.whatwg.org/multipage/server-sent-events.html.
// This is a finite stream reader; it does not reconnect or replay a stream.
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSseEvents = readSseEvents;
exports.readJsonSse = readJsonSse;
async function* readSseEvents(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let line = '';
    let data = [];
    let event = '';
    let id = '';
    let skipLF = false;
    let ended = false;
    function consumeLine() {
        const current = line;
        line = '';
        if ('' === current) {
            const out = 0 < data.length ? { data: data.join('\n'), event: event || 'message', id } : undefined;
            data = [];
            event = '';
            return out;
        }
        if (current.startsWith(':'))
            return;
        const colon = current.indexOf(':');
        const field = colon < 0 ? current : current.slice(0, colon);
        let value = colon < 0 ? '' : current.slice(colon + 1);
        if (value.startsWith(' '))
            value = value.slice(1);
        if ('data' === field)
            data.push(value);
        else if ('event' === field)
            event = value;
        else if ('id' === field && !value.includes('\0'))
            id = value;
    }
    function* feed(text) {
        for (const character of text) {
            if (skipLF) {
                skipLF = false;
                if ('\n' === character)
                    continue;
            }
            if ('\r' === character || '\n' === character) {
                skipLF = '\r' === character;
                const event = consumeLine();
                if (event)
                    yield event;
            }
            else
                line += character;
        }
    }
    try {
        for (;;) {
            const next = await reader.read();
            if (next.done) {
                ended = true;
                yield* feed(decoder.decode());
                // An event without its terminating blank line is incomplete and is
                // discarded, as required by the SSE framing contract.
                return;
            }
            yield* feed(decoder.decode(next.value, { stream: true }));
        }
    }
    finally {
        try {
            if (!ended)
                await reader.cancel();
        }
        finally {
            reader.releaseLock();
        }
    }
}
// MABe emits a JSON value in each data field. Errors never echo the payload.
async function* readJsonSse(body, error) {
    for await (const event of readSseEvents(body)) {
        let payload;
        try {
            payload = JSON.parse(event.data);
        }
        catch {
            throw error('response_sse_invalid', 'SSE data is not valid JSON');
        }
        if (payload && 'object' === typeof payload && 'error' in payload) {
            throw error('response_sse_error', 'The API reported an error inside the SSE stream');
        }
        yield payload;
    }
}
//# sourceMappingURL=SseUtility.js.map