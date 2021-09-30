import { GameObjectWorld } from '../../GameObjectWorld';
import { QuadVertexComponent } from './QuadVertexComponent';
import { SetQuadColor } from './SetQuadColor';
import { SetQuadPosition } from './SetQuadPosition';
import { SetQuadUVs } from './SetQuadUVs';
import { addComponent } from 'bitecs';

export function AddQuadVertex (id: number, width: number = 0, height: number = 0): void
{
    addComponent(GameObjectWorld, QuadVertexComponent, id);

    if (width || height)
    {
        SetQuadUVs(id, 0, 0, 1, 1);
        SetQuadColor(id, 1, 1, 1, 1);
        SetQuadPosition(id, 0, 0, 0, height, width, height, width, 0);
    }
}
