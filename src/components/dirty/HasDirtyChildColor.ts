import { DIRTY, DirtyComponent } from './DirtyComponent';

export function HasDirtyChildColor (id: number): boolean
{
    return !!(DirtyComponent.data[id][DIRTY.CHILD_COLOR]);
}
