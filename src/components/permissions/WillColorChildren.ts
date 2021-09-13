import { PERMISSION, PermissionsComponent } from './PermissionsComponent';

export function WillColorChildren (id: number): boolean
{
    return !!(PermissionsComponent.data[id][PERMISSION.WILL_COLOR_CHILDREN]);
}
