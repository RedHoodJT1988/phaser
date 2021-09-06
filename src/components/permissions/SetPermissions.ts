import { GameObjectStore, PERMISSION } from '../../gameobjects/GameObjectStore';

export function SetPermissions (id: number): void
{
    const data = GameObjectStore.ui32[id];

    data[PERMISSION.VISIBLE] = 1;
    data[PERMISSION.VISIBLE_CHILDREN] = 1;
    data[PERMISSION.WILL_UPDATE] = 1;
    data[PERMISSION.WILL_UPDATE_CHILDREN] = 1;
    data[PERMISSION.WILL_RENDER] = 1;
    data[PERMISSION.WILL_RENDER_CHILDREN] = 1;
    data[PERMISSION.WILL_CACHE_CHILDREN] = 0;
    data[PERMISSION.WILL_TRANSFORM_CHILDREN] = 1;
    data[PERMISSION.WILL_COLOR_CHILDREN] = 1;
}
