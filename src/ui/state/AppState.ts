import {observable, computed} from 'mobx';
import {GizmoType} from 'viewport/gizmo';
import {getBoneConfig} from 'viewport/scene';
import {clamp} from 'ui/utils';

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
  @observable _previewRange = [150, 50]; // [0, MAX_FRAMES];
  @observable currentFrame = 0;
  @observable isPlaying = false; // playing animation should disable UI

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
  get previewRange_Min () { return Math.min(...this._previewRange); }

  @computed
  get previewRange_Max () { return Math.max(...this._previewRange); }

  @computed
  get previewRange () {
    return [ this.previewRange_Min, this.previewRange_Max, ];
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

}
