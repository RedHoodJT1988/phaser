import { TRANSFORM, Transform2DComponent } from '../transform/Transform2DComponent';

export function SetInViewFromBounds (id: number, cx: number, cy: number, cright: number, cbottom: number): void
{
    const data: Float32Array = Transform2DComponent.data[id];

    const bx = data[TRANSFORM.BOUNDS_X1];
    const by = data[TRANSFORM.BOUNDS_Y1];
    const br = data[TRANSFORM.BOUNDS_X2];
    const bb = data[TRANSFORM.BOUNDS_Y2];

    data[TRANSFORM.IN_VIEW] = Number(!(cright < bx || cbottom < by || cx > br || cy > bb));
}
