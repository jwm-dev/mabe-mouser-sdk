import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Stream, StreamLoadMatch } from '../MabeMouserTypes';
declare class StreamEntity extends MabeMouserEntityBase<Stream> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: StreamEntity): StreamEntity;
    load(this: any, reqmatch?: StreamLoadMatch, ctrl?: Control): Promise<StreamEntity>;
}
export { StreamEntity };
