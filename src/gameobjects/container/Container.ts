import { TRANSFORM, Transform2DComponent } from '../../components/transform/Transform2DComponent';

import { AddTransform2DComponent } from '../../components/transform/AddTransform2DComponent';
import { Color } from '../../components/color/Color';
import { Flush } from '../../renderer/webgl1/renderpass/Flush';
import { GameObject } from '../GameObject';
import { GetDefaultOriginX } from '../../config/defaultorigin/GetDefaultOriginX';
import { GetDefaultOriginY } from '../../config/defaultorigin/GetDefaultOriginY';
import { IContainer } from './IContainer';
import { IGameObject } from '../IGameObject';
import { IRectangle } from '../../geom/rectangle/IRectangle';
import { IRenderPass } from '../../renderer/webgl1/renderpass/IRenderPass';
import { IShader } from '../../renderer/webgl1/shaders/IShader';
import { Origin } from '../../components/transform/Origin';
import { PopColor } from '../../renderer/webgl1/renderpass/PopColor';
import { PopShader } from '../../renderer/webgl1/renderpass/PopShader';
import { Position } from '../../components/transform/Position';
import { Rectangle } from '../../geom/rectangle/Rectangle';
import { Scale } from '../../components/transform/Scale';
import { SetColor } from '../../renderer/webgl1/renderpass/SetColor';
import { SetDirtyTransform } from '../../components/dirty/SetDirtyTransform';
import { SetShader } from '../../renderer/webgl1/renderpass/SetShader';
import { Size } from '../../components/transform/Size';
import { Skew } from '../../components/transform/Skew';
import { UpdateAxisAligned } from '../../components/transform/UpdateAxisAligned';

export class Container extends GameObject implements IContainer
{
    readonly type: string = 'Container';

    position: Position;
    scale: Scale;
    skew: Skew;
    origin: Origin;
    size: Size;
    color: Color;

    shader: IShader;

    private _rotation: number = 0;

    constructor (x: number = 0, y: number = 0)
    {
        super();

        const id = this.id;

        AddTransform2DComponent(id);

        this.position = new Position(id, x, y);
        this.scale = new Scale(id);
        this.skew = new Skew(id);
        this.size = new Size(id);
        this.origin = new Origin(id, GetDefaultOriginX(), GetDefaultOriginY());
        this.color = new Color(id);
    }

    renderGL <T extends IRenderPass> (renderPass: T): void
    {
        if (this.shader)
        {
            Flush(renderPass);

            SetShader(this.shader, 0);
        }

        SetColor(renderPass, this.color);

        this.preRenderGL(renderPass);
    }

    postRenderGL <T extends IRenderPass> (renderPass: T): void
    {
        if (this.shader)
        {
            Flush(renderPass);

            PopShader();
        }

        PopColor(renderPass, this.color);
    }

    set x (value: number)
    {
        this.position.x = value;
    }

    get x (): number
    {
        return this.position.x;
    }

    set y (value: number)
    {
        this.position.y = value;
    }

    get y (): number
    {
        return this.position.y;
    }

    set rotation (value: number)
    {
        this._rotation = value;

        const id = this.id;

        Transform2DComponent.data[id][TRANSFORM.ROTATION] = value;

        UpdateAxisAligned(id);
        SetDirtyTransform(id);
    }

    get rotation (): number
    {
        return this._rotation;
    }

    get alpha (): number
    {
        return this.color.alpha;
    }

    set alpha (value: number)
    {
        this.color.alpha = value;
    }

    setAlpha (value: number): this
    {
        this.alpha = value;

        return this;
    }

    setPosition (x: number, y?: number): this
    {
        this.position.set(x, y);

        return this;
    }

    setScale (x: number, y?: number): this
    {
        this.scale.set(x, y);

        return this;
    }

    setRotation (value: number): this
    {
        this.rotation = value;

        return this;
    }

    setSkew (x: number, y?: number): this
    {
        this.skew.set(x, y);

        return this;
    }

    setOrigin (x: number, y?: number): this
    {
        this.origin.set(x, y);

        return this;
    }

    getBounds (): IRectangle
    {
        const data = Transform2DComponent.data[this.id];

        const x = data[TRANSFORM.BOUNDS_X1];
        const y = data[TRANSFORM.BOUNDS_Y1];
        const right = data[TRANSFORM.BOUNDS_X2];
        const bottom = data[TRANSFORM.BOUNDS_Y2];

        return new Rectangle(x, y, right - x, bottom - y);
    }

    destroy (reparentChildren?: IGameObject): void
    {
        this.position.destroy();
        this.scale.destroy();
        this.skew.destroy();
        this.origin.destroy();

        super.destroy(reparentChildren);
    }
}
