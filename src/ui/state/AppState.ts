import {observable, computed} from 'mobx';
import {GizmoType} from 'viewport/gizmo';
import {getBoneConfig} from 'viewport/scene';


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
  @observable showDebug = false;

  @computed
  get currentObjectData () {
    const name = this.selectedObject;
    if (!name) { return undefined; }

    const cfg = getBoneConfig(name);

    return {
      name,
      isBone: true,
      constraints: cfg.constraints,
      hasKeyframeAtCurrentFrame: false,
      keyframe: this.getCurrentObjectKeyframe(),
    };
  }

  private getCurrentObjectKeyframe () {
    return {
      frameId: 0,
      position: [0, 1, 2],
      rotation: [0, 1, 2, 3],
      scale: [0, 1, 2],
    };
  }

}
