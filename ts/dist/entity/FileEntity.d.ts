import { MabeMouserEntityBase } from '../MabeMouserEntityBase';
import type { MabeMouserSDK } from '../MabeMouserSDK';
import type { Control } from '../types';
import type { File, FileLoadMatch } from '../MabeMouserTypes';
declare class FileEntity extends MabeMouserEntityBase<File> {
    constructor(client: MabeMouserSDK, entopts: any);
    make(this: FileEntity): FileEntity;
    load(this: any, reqmatch?: FileLoadMatch, ctrl?: Control): Promise<FileEntity>;
}
export { FileEntity };
