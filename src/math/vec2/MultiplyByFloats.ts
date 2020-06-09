import { IVec2 } from './IVec2';
import { Vec2 } from './Vec2';

export function MultiplyByFloats (a: IVec2, x: number, y: number, out: Vec2 = new Vec2()): IVec2
{
    return out.set(
        a.x * x,
        a.y * y
    );
}
