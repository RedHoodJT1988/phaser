import * as WorldEvents from './events';

import { Query, defineQuery } from 'bitecs';

import { BaseWorld } from './BaseWorld';
import { Begin } from '../renderer/webgl1/renderpass/Begin';
import { BoundsIntersects } from '../components/bounds/BoundsIntersects';
import { ClearDirtyChild } from '../components/dirty/ClearDirtyChild';
import { ClearDirtyDisplayList } from '../components/dirty/ClearDirtyDisplayList';
import { Emit } from '../events/Emit';
import { GameObjectCache } from '../gameobjects/GameObjectCache';
import { GameObjectWorld } from '../GameObjectWorld';
import { HasDirtyChild } from '../components/dirty/HasDirtyChild';
import { HasDirtyDisplayList } from '../components/dirty/HasDirtyDisplayList';
import { IRenderPass } from '../renderer/webgl1/renderpass/IRenderPass';
import { IScene } from '../scenes/IScene';
import { IStaticCamera } from '../camera/IStaticCamera';
import { IStaticWorld } from './IStaticWorld';
import { PopColor } from '../renderer/webgl1/renderpass/PopColor';
import { RebuildWorldList } from './RebuildWorldList';
import { RebuildWorldTransforms } from './RebuildWorldTransforms';
import { RenderDataComponent } from './RenderDataComponent';
import { RendererInstance } from '../renderer/RendererInstance';
import { ResetWorldRenderData } from './ResetWorldRenderData';
import { SetColor } from '../renderer/webgl1/renderpass/SetColor';
import { StaticCamera } from '../camera/StaticCamera';
import { Transform2DComponent } from '../components/transform/Transform2DComponent';
import { UpdateLocalTransform } from '../components/transform/UpdateLocalTransform';
import { UpdateVertexPositionSystem } from '../components/vertices/UpdateVertexPositionSystem';

//  A Static World is designed specifically to have a bounds of a fixed size
//  and a camera that doesn't move at all (no scrolling, rotation, etc)
//  Because it has a fixed size, there is no camera culling enabled.
//  Games that use this kind of world include Pacman, Bejeweled and 2048.

export class StaticWorld extends BaseWorld implements IStaticWorld
{
    readonly type: string = 'StaticWorld';

    declare camera: IStaticCamera;

    private transformQuery: Query;

    constructor (scene: IScene)
    {
        super(scene);

        const tag = this.tag;

        this.transformQuery = defineQuery([ tag, Transform2DComponent ]);

        const renderer = RendererInstance.get();

        this.camera = new StaticCamera(renderer.width, renderer.height);
    }

    //  We should update the display list and world transforms regardless of
    //  if this World will render or not (i.e. all children are outside viewport)
    preRender (gameFrame: number): boolean
    {
        const id = this.id;

        ResetWorldRenderData(id, gameFrame);

        RenderDataComponent.rebuiltList[id] = 0;
        RenderDataComponent.rebuiltWorld[id] = 0;

        ClearDirtyChild(id);

        let isDirty = UpdateLocalTransform(id, GameObjectWorld, this.transformQuery);

        const dirtyDisplayList = HasDirtyDisplayList(id);

        if (dirtyDisplayList || HasDirtyChild(id))
        {
            //  TODO - This should only run over the branches that are dirty, not the whole World.

            //  This will update the Transform2DComponent.world values.
            RebuildWorldTransforms(this, id, false);

            RenderDataComponent.rebuiltWorld[id] = 1;

            isDirty = true;
        }

        UpdateVertexPositionSystem(id, GameObjectWorld, this.transformQuery);

        if (dirtyDisplayList)
        {
            this.listLength = 0;

            RebuildWorldList(this, id, 0);

            RenderDataComponent.numChildren[id] = this.getNumChildren();
            RenderDataComponent.numRenderable[id] = this.listLength / 4;
            RenderDataComponent.rebuiltList[id] = 1;

            ClearDirtyDisplayList(id);

            isDirty = true;
        }

        //  By this point we've got a fully rebuilt World, where all dirty Game Objects have been
        //  refreshed and had their coordinates moved to their quad vertices.

        //  We've also got a complete local render list, in display order, that can be processed further
        //  before rendering (i.e. spatial tree, bounds, etc)

        return isDirty;
    }

    renderGL <T extends IRenderPass> (renderPass: T): void
    {
        SetColor(renderPass, this.color);

        Emit(this, WorldEvents.WorldRenderEvent, this);

        const camera = this.camera;

        Begin(renderPass, camera);

        const list = this.renderList;

        const [ x, y, right, bottom ] = camera.getBounds();

        let rendered = 0;

        for (let i = 0; i < this.listLength; i += 2)
        {
            const eid = list[i];
            const type = list[i + 1];
            const entry = GameObjectCache.get(eid);

            if (type === 1)
            {
                //  We've already rendered this Game Object, so skip bounds checking
                entry.postRenderGL(renderPass);
            }
            else if (BoundsIntersects(eid, x, y, right, bottom))
            {
                entry.renderGL(renderPass);

                if (type === 2)
                {
                    entry.postRenderGL(renderPass);
                }

                rendered++;
            }
        }

        PopColor(renderPass, this.color);

        const id = this.id;

        window['renderStats'] = {
            gameFrame: RenderDataComponent.gameFrame[id],
            numChildren: RenderDataComponent.numChildren[id],
            numRendererd: rendered,
            numRenderable: RenderDataComponent.numRenderable[id],
            dirtyLocal: RenderDataComponent.dirtyLocal[id],
            dirtyVertices: RenderDataComponent.dirtyVertices[id],
            rebuiltList: RenderDataComponent.rebuiltList[id],
            rebuiltWorld: RenderDataComponent.rebuiltWorld[id]
        };

        Emit(this, WorldEvents.WorldPostRenderEvent, renderPass, this);
    }
}
