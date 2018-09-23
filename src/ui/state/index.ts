import {observable, computed} from 'mobx';
import {Keyframe} from 'viewport/animation';
import {GizmoType} from 'viewport/gizmo';
import {clamp} from 'ui/utils';

export const MAX_MARKER_SIZE = 20;
export const MAX_GIZMO_SIZE = 20;

const MAX_FRAMES = 250;

enum Constraint { Allow, Disallow, } // AllowLocal, AllowGlobal
const AllowAll = [Constraint.Allow, Constraint.Allow, Constraint.Allow];
const DisallowAll = [Constraint.Disallow, Constraint.Disallow, Constraint.Disallow];

export class AppState {

  // when viewport fills whole view
  @observable isFullscreen = false;
  // current manipulator
  @observable currentGizmo = GizmoType.Move;
  @observable gizmoSize = 10;
  //
  @observable isUseLocalSpace = true;
  @observable markerSize = 10;
  @observable useSlerp = true;
  @observable showTimeAsSeconds = true;
  @observable showDebug = true;

  isGizmoAllowed (gizmoType: GizmoType) {
    return gizmoType !== GizmoType.Scale;
  }

  @computed
  get currentObject () {
    return {
      name: 'BoneLowerArm',
      isBone: true, // one of {Bone, Object3d}
      hasKeyframeAtCurrentFrame: false,
      keyframe: {
        frameId: 0,
        position: [0, 1, 2],
        rotation: [0, 1, 2, 3],
        scale: [0, 1, 2],
      },
      constraints: {
        position: AllowAll,
        rotation: [Constraint.Disallow, Constraint.Allow, Constraint.Disallow],
        scale:    DisallowAll,
      },
    };
  }

}


type Timeline = Keyframe[];
// type TimelineMap = {[key: string]: Timeline};

const KEYFRAMES =  [
  {frameId: 5, },
  {frameId: 15, },
  {frameId: 120, },
  {frameId: 200, },
] as Keyframe[];


export class TimelineState {

  // current frame on timeline
  @observable currentFrame = 0;
  // playing animation should disable UI
  @observable isPlaying = false;
  // all animation data
  // private timelines = {} as TimelineMap;
  // preview
  @observable previewRange = [150, 50]; // [0, MAX_FRAMES];

  @computed
  get frameCount () { return MAX_FRAMES; }

  @computed
  get currentObjectTimeline () {
    return KEYFRAMES;
  }

  clampFrame (frameId: number) {
    return clamp(frameId, 0, this.frameCount - 1);
  }

  private getKeyframeBefore (keyframes: Timeline, frameId: number, allowCurrent: boolean) {
    const isExactCurrent = (k: Keyframe) => allowCurrent && k.frameId === frameId;
    const isBefore = (k: Keyframe) => k.frameId < frameId || isExactCurrent(k);

    let frameBeforeIdx = -1;
    keyframes.forEach((k: Keyframe, idx: number) => {
      if (isBefore(k)) {
        frameBeforeIdx = idx;
      }
    });

    return frameBeforeIdx;
  }

  /**
   * TODO test me!
   * get frame directly before `frameId` and one directly after
   * @param allowCurrent returned frames has to be different then current one
   */
  getCurrentObjectKeyframeNeighbours (frameId: number, allowCurrent: boolean = true) {
    // NOTE: we require that timeline has keyframes SORTED by frameId
    // or:  && k.frameId > timeline[frameBeforeIdx].frameId
    const keyframes = this.currentObjectTimeline;
    const frameBeforeIdx = this.getKeyframeBefore(keyframes, frameId, allowCurrent);

    let keyframeAfter = keyframes[frameBeforeIdx + 1];
    const isAfterSameAsCurrent = keyframeAfter && keyframeAfter.frameId === frameId;
    if (!allowCurrent && isAfterSameAsCurrent) {
      keyframeAfter = keyframes[frameBeforeIdx + 2];
    }

    return [keyframes[frameBeforeIdx], keyframeAfter];
  }

  deleteKeyframeForCurrentObject (frameId: number) {
    console.log(`would delete keyframe ${frameId}`);
  }

  /*
  // sets keyframe for selected object
  setKeyframe (name: string, keyframe: Keyframe) {
    const currentObj = this.getSelectedObj();
    const time = this.getCurrentTime();
    const timeline = this.getTimeline(currentObj);
    timelineSet(timeline, time, keyframe);
  }

  // delete keyframe
  deleteKeyframe (name: string, frameId: number) {
  }

  // get timeline for an object
  getTimeline (name: string) {
  }
  */
}

export const appState = new AppState();
export const timelineState = new TimelineState();
