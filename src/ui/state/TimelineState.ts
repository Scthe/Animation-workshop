// import {observable, computed} from 'mobx';
import {Keyframe} from 'viewport/animation';
import {Transform} from 'gl-utils';
import {find, findLast} from 'lodash';


// type TimelineMap = {[key: string]: Timeline};
type BoneName = string;

const KEYFRAMES =  [
  {frameId: 5, },
  {frameId: 15, },
  {frameId: 120, },
  {frameId: 200, },
] as Keyframe[];

const isKeyframeExact = (frameId: number, allowExact: boolean) => (keyframe: Keyframe) =>
  allowExact && keyframe.frameId === frameId;
const isKeyframeBefore = (frameId: number, allowExact: boolean) => (keyframe: Keyframe) =>
  keyframe.frameId < frameId || isKeyframeExact(frameId, allowExact)(keyframe);
const isKeyframeAfter = (frameId: number, allowExact: boolean) => (keyframe: Keyframe) =>
  keyframe.frameId > frameId || isKeyframeExact(frameId, allowExact)(keyframe);


export class TimelineState {
  // all animation data
  // @observable timelines = {} as TimelineMap;

  getTimeline (boneName: BoneName) {
    // if (!timelines[name]) {
      // timelines[name] = [];
    // }
    return KEYFRAMES;
  }

  hasKeyframeAt (boneName: BoneName, frameId: number) {
    return !!this.getKeyframeAt(boneName, frameId);
  }

  insertKeyframeAt (boneName: BoneName, frameId: number, transform: Transform) {
    console.log(`would add keyframe ${boneName}[${frameId}]`, transform);
    /*
    const timeline = this.getTimeline(boneName);
    if (!timeline) { return undefined; }

    const keyframe = { frameId, transform, } as Keyframe;
    const newTimeline = [...timeline, keyframe];
    // TODO should keep reference?
    this.timelines[boneName] = timeline.filter(keyframe => keyframe.frameId !== frameId);
    */
  }

  deleteKeyframe (boneName: BoneName, frameId: number) {
    console.log(`would delete keyframe ${boneName}[${frameId}]`);
    /*
    const timeline = this.getTimeline(boneName);
    if (!timeline) { return undefined; }
    // TODO should keep reference?
    this.timelines[boneName] = timeline.filter(keyframe => keyframe.frameId !== frameId);
    */
  }

  private getKeyframeAt (boneName: BoneName, frameId: number) {
    const timeline = this.getTimeline(boneName);
    if (!timeline) { return undefined; }
    return timeline.find(keyframe => keyframe.frameId === frameId);
  }

  getKeyframeBefore (boneName: BoneName, frameId: number, allowExact = true) {
    const timeline = this.getTimeline(boneName);
    if (!timeline) { return undefined; }

    return findLast(timeline, isKeyframeBefore(frameId, allowExact));
  }

  getKeyframeAfter (boneName: BoneName, frameId: number, allowExact = true) {
    const timeline = this.getTimeline(boneName);
    if (!timeline) { return undefined; }

    return find(timeline, isKeyframeAfter(frameId, allowExact));
  }

}
