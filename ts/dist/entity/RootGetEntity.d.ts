import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { RootGet, RootGetLoadMatch } from '../MabeMouserTypes';
declare class RootGetEntity extends MabeMouserEntityBase<RootGet> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: RootGetEntity): RootGetEntity;
    load(this: any, reqmatch?: RootGetLoadMatch, ctrl?: Control): Promise<RootGetEntity>;
}
export { RootGetEntity };
