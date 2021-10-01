import { PERMISSION, PermissionsComponent } from "./PermissionsComponent";
import { GetVisibleChildren } from "./GetVisibleChildren";
export function WillRenderChildren(id) {
  return GetVisibleChildren(id) && !!PermissionsComponent.data[id][PERMISSION.WILL_RENDER_CHILDREN];
}