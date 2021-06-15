import { GetChildrenFromParentID } from '../components/hierarchy';
import { IGameObject } from '../gameobjects/IGameObject';

export function GetLastChild <P extends IGameObject> (parent: P, property?: string | symbol, value?: never): IGameObject | undefined
{
    const children = GetChildrenFromParentID(parent.id);

    if (!property)
    {
        return children.pop();
    }

    for (let i = 0; i < children.length; i++)
    {
        const child = children[i];

        const descriptor = Object.getOwnPropertyDescriptor(child, property);

        if (descriptor && (value === undefined || value === descriptor.value))
        {
            return child;
        }
    }
}
