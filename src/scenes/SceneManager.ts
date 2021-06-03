import { Changed, addEntity, defineQuery } from 'bitecs';
import { Emit, Once } from '../events';
import { SceneAfterUpdateEvent, SceneBeforeUpdateEvent, ScenePreRenderEvent, SceneUpdateEvent } from './events';

import { AddSceneRenderDataComponent } from './AddSceneRenderDataComponent';
import { Game } from '../Game';
import { GameInstance } from '../GameInstance';
import { GameObjectWorld } from '../GameObjectWorld';
import { GetScenes } from '../config/scenes';
import { IBaseWorld } from '../world/IBaseWorld';
import { IScene } from './IScene';
import { ISceneRenderData } from './ISceneRenderData';
import { LocalMatrix2DComponent } from '../components/transform';
import { ResetSceneRenderData } from './ResetSceneRenderData';
import { SceneManagerInstance } from './SceneManagerInstance';
import { SceneRenderDataComponent } from './SceneRenderDataComponent';
import { UpdateLocalTransform2DSystem } from '../components/transform/UpdateLocalTransform2DSystem';
import { UpdateVertexPositionSystem } from '../components/vertices/UpdateVertexPositionSystem';

export class SceneManager
{
    readonly id: number = addEntity(GameObjectWorld);

    game: Game;

    scenes: Map<string, IScene>  = new Map();

    //  Used by Install to assign default scene keys when not specified
    sceneIndex: number = 0;

    //  Flush the cache
    flush: boolean = false;

    //  List of worlds going to be rendered this frame (reset every step)
    private _worldList: Set<IBaseWorld> = new Set();

    changedMatrixQuery = defineQuery([ Changed(LocalMatrix2DComponent) ]);

    constructor ()
    {
        this.game = GameInstance.get();

        SceneManagerInstance.set(this);

        AddSceneRenderDataComponent(this.id);

        Once(this.game, 'boot', () => this.boot());
    }

    boot (): void
    {
        GetScenes().forEach(scene => new scene());
    }

    update (delta: number, time: number): void
    {
        for (const scene of this.scenes.values())
        {
            Emit(scene, SceneBeforeUpdateEvent, delta, time);
            Emit(scene, SceneUpdateEvent, delta, time);
        }

        //  Process all dirty 2D transforms and update the local matrix across all Worlds and Scenes
        UpdateLocalTransform2DSystem(GameObjectWorld);

        for (const scene of this.scenes.values())
        {
            Emit(scene, SceneAfterUpdateEvent, delta, time);
        }
    }

    //  Run through all Scenes and Worlds within them, telling them to prepare to render
    //  The renderer itself tells them to actually render
    preRender (gameFrame: number): void
    {
        ResetSceneRenderData(this.id, gameFrame);

        //  TODO - This doesn't need resetting every frame, only when a World changes
        this._worldList.clear();

        const dirtyTransforms: number[] = this.changedMatrixQuery(GameObjectWorld);

        for (const scene of this.scenes.values())
        {
            Emit(scene, ScenePreRenderEvent, gameFrame, dirtyTransforms);
        }

        //  Update all vertices across the whole game, ready for rendering
        UpdateVertexPositionSystem(GameObjectWorld);

        if (this.flush)
        {
            //  Invalidate the renderer cache
            SceneRenderDataComponent.numDirtyFrames[this.id]++;

            //  And reset
            this.flush = false;
        }
    }

    updateRenderData (world: IBaseWorld, totalFrames: number, dirtyFrames: number, dirtyCameras: number): void
    {
        const id = this.id;

        SceneRenderDataComponent.numTotalFrames[id] += totalFrames;
        SceneRenderDataComponent.numDirtyFrames[id] += dirtyFrames;
        SceneRenderDataComponent.numDirtyCameras[id] += dirtyCameras;

        this._worldList.add(world);
    }

    getRenderData (): ISceneRenderData
    {
        const id = this.id;

        return {
            gameFrame: SceneRenderDataComponent.gameFrame[id],
            numTotalFrames: SceneRenderDataComponent.numTotalFrames[id],
            numDirtyFrames: SceneRenderDataComponent.numDirtyFrames[id],
            numDirtyCameras: SceneRenderDataComponent.numDirtyCameras[id],
            worlds: this._worldList
        };
    }
}
