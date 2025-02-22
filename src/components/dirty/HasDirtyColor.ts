import { DIRTY, DirtyComponent } from './DirtyComponent';

export function HasDirtyColor (id: number): boolean
{
    return !!(DirtyComponent.data[id][DIRTY.COLOR]);
}
