import { PERMISSION, PermissionsComponent } from "./PermissionsComponent";
import { SetDirtyParents } from "../dirty/SetDirtyParents";
export function SetVisible(id, value) {
  PermissionsComponent.data[id][PERMISSION.VISIBLE] = Number(value);
  SetDirtyParents(id);
}