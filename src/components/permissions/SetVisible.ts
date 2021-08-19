import { PERMISSION, PermissionsComponent } from './PermissionsComponent';

import { GetWorldID } from '../hierarchy/GetWorldID';
import { SetDirtyDisplayList } from '../dirty/SetDirtyDisplayList';
import { SetDirtyParents } from '../dirty/SetDirtyParents';

export function SetVisible (value: boolean, id: number): void
{
    PermissionsComponent.data[id][PERMISSION.VISIBLE] = Number(value);

    SetDirtyParents(id);
    SetDirtyDisplayList(GetWorldID(id));
}
