import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Social, SocialLoadMatch } from '../MabeMouserTypes';
declare class SocialEntity extends MabeMouserEntityBase<Social> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: SocialEntity): SocialEntity;
    load(this: any, reqmatch?: SocialLoadMatch, ctrl?: Control): Promise<SocialEntity>;
}
export { SocialEntity };
