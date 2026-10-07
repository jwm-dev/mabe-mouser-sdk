import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Activity, ActivityLoadMatch } from '../MabeMouserTypes';
declare class ActivityEntity extends MabeMouserEntityBase<Activity> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: ActivityEntity): ActivityEntity;
    load(this: any, reqmatch?: ActivityLoadMatch, ctrl?: Control): Promise<ActivityEntity>;
}
export { ActivityEntity };
