import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { Heatmap, HeatmapLoadMatch } from '../MabeMouserTypes';
declare class HeatmapEntity extends MabeMouserEntityBase<Heatmap> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: HeatmapEntity): HeatmapEntity;
    load(this: any, reqmatch?: HeatmapLoadMatch, ctrl?: Control): Promise<HeatmapEntity>;
}
export { HeatmapEntity };
