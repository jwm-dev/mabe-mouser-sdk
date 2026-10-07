import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Overview, OverviewLoadMatch } from '../MabeMouserTypes';
declare class OverviewEntity extends MabeMouserEntityBase<Overview> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: OverviewEntity): OverviewEntity;
    load(this: any, reqmatch?: OverviewLoadMatch, ctrl?: Control): Promise<OverviewEntity>;
}
export { OverviewEntity };
