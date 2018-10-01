import {observable, computed} from 'mobx';
import {GizmoType} from 'viewport/gizmo';


// consts
export const MAX_MARKER_SIZE = 20;
export const MAX_GIZMO_SIZE = 100;
export const MAX_CAMERA_MOVE_SPEED = 20;
export const MAX_CAMERA_ROTATE_SPEED = 20;


export class AppState {

  // when viewport fills whole view
  @observable isFullscreen = false;
  // selection
  @observable selectedObject = undefined as string;
  // current manipulator
  @observable currentGizmo = GizmoType.Move;
  @observable gizmoSize = MAX_GIZMO_SIZE / 2;
  // camera
  @observable cameraMoveSpeed = MAX_CAMERA_MOVE_SPEED / 2;
  @observable cameraRotateSpeed = MAX_CAMERA_ROTATE_SPEED / 2;
  // settings
  @observable isUseLocalSpace = true;
  @observable markerSize = MAX_MARKER_SIZE / 2;
  @observable useSlerp = true;
  @observable showTimeAsSeconds = true;
  @observable showDebug = true;

  isGizmoAllowed (gizmoType: GizmoType) {
    return gizmoType !== GizmoType.Scale;
  }

  @computed
  get currentObject () {
    return this.selectedObject ? {
      hasKeyframeAtCurrentFrame: false,
      keyframe: {
        frameId: 0,
        position: [0, 1, 2],
        rotation: [0, 1, 2, 3],
        scale: [0, 1, 2],
      },
      // TODO remove:
      name: this.selectedObject,
      isBone: true, // one of {Bone, Object3d}
      /*constraints: {
        position: AllowAll,
        rotation: [Constraint.Disallow, Constraint.Allow, Constraint.Disallow],
        scale:    DisallowAll,
      },*/
    } : undefined;
  }

}
