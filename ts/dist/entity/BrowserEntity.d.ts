import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Browser, BrowserLoadMatch } from '../MabeMouserTypes';
declare class BrowserEntity extends MabeMouserEntityBase<Browser> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: BrowserEntity): BrowserEntity;
    load(this: any, reqmatch?: BrowserLoadMatch, ctrl?: Control): Promise<BrowserEntity>;
}
export { BrowserEntity };
