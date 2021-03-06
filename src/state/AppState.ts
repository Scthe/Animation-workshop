import {observable, computed, action} from 'mobx';
import {GizmoType} from 'viewport/gizmo';
import {getBoneConfig, getActionableGizmo, isAnyAxisAllowed} from 'viewport/scene';
import {clamp} from 'gl-utils';

// consts
export const MAX_MARKER_SIZE = 20;
export const MAX_GIZMO_SIZE = 100;
export const MAX_CAMERA_MOVE_SPEED = 20;
export const MAX_CAMERA_ROTATE_SPEED = 20;

const MAX_FRAMES = 250;


export class AppState {

  // when viewport fills whole view
  @observable isFullscreen = false;
  // selection
  @observable selectedObjectName: string = undefined as string;
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
  // playback
  @observable _previewRange = [0, MAX_FRAMES];
  @observable currentFrame = 0;
  @observable isPlaying = false; // playing animation should disable UI
  // misc
  @observable showMarkers = true;

  @computed
  get frameCount () { return MAX_FRAMES; }

  clampFrame (frameId: number) {
    return clamp(frameId, 0, this.frameCount - 1);
  }

  gotoFrame (frameId: number) {
    const frameIdFixed = this.clampFrame(frameId);

    if (!this.isPlaying && this.currentFrame !== frameIdFixed) {
      this.currentFrame = frameIdFixed;
    }
  }

  @computed
  get previewRange () {
    return this._previewRange;
  }

  @computed
  get previewRangeSorted () {
    return [
      Math.min(...this.previewRange),
      Math.max(...this.previewRange)
    ];
  }

  resetPreviewRange () {
    this._previewRange = [0, this.frameCount];
  }

  @computed
  get currentObjectData () {
    const name = this.selectedObjectName;
    if (!name) { return undefined; }

    const cfg = getBoneConfig(name);

    return {
      name,
      isBone: true,
      constraints: cfg.constraints,
    };
  }

  @action
  setCurrentObject (objName: string) {
    this.selectedObjectName = objName;
    const cfg = getBoneConfig(objName);

    if (!isAnyAxisAllowed(this.currentGizmo, cfg.constraints)) {
      this.currentGizmo = cfg ? getActionableGizmo(cfg.constraints) : GizmoType.Move;
    }
  }

}
