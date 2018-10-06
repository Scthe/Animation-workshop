import {observable, computed} from 'mobx';
import {Keyframe, getNeighboursKeyframes} from 'viewport/animation';
import {clamp} from 'ui/utils';

const MAX_FRAMES = 250;

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

  getCurrentObjectKeyframeNeighbours (frameId: number, allowCurrent: boolean = true) {
    return getNeighboursKeyframes(this.currentObjectTimeline, frameId, allowCurrent);
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
    if (!timelines[name]) {
      timelines[name] = [];
    }
    return timelines[name];
  }
  */
}
