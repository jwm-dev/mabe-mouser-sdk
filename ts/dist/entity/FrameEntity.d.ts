import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Frame, FrameLoadMatch } from '../MabeMouserTypes';
declare class FrameEntity extends MabeMouserEntityBase<Frame> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: FrameEntity): FrameEntity;
    load(this: any, reqmatch?: FrameLoadMatch, ctrl?: Control): Promise<FrameEntity>;
}
export { FrameEntity };
