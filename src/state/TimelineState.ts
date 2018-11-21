import {observable} from 'mobx';
import {Keyframe, Timeline, createKeyframe} from 'viewport/animation';
import {Transform} from 'gl-utils';
import {find, findLast, sortBy} from 'lodash';


type TimelineMap = {[key: string]: Timeline};
type BoneName = string;

const isKeyframeExact = (frameId: number, allowExact: boolean) => (keyframe: Keyframe) =>
  allowExact && keyframe.frameId === frameId;
const isKeyframeBefore = (frameId: number, allowExact: boolean) => (keyframe: Keyframe) =>
  keyframe.frameId < frameId || isKeyframeExact(frameId, allowExact)(keyframe);
const isKeyframeAfter = (frameId: number, allowExact: boolean) => (keyframe: Keyframe) =>
  keyframe.frameId > frameId || isKeyframeExact(frameId, allowExact)(keyframe);

const removeKeyframeAt = (timeline: Timeline, frameId: number) =>
  timeline.filter(keyframe => keyframe.frameId !== frameId);

export class TimelineState {
  // all animation data
  @observable timelines: TimelineMap = {};

  getTimeline (boneName: BoneName) {
    if (!this.timelines[boneName]) {
      this.setTimeline(boneName, [] as Timeline);
    }
    return this.timelines[boneName];
  }

  private setTimeline (boneName: BoneName, timeline: Timeline) {
    this.timelines[boneName] = timeline;
  }

  hasKeyframeAt (boneName: BoneName, frameId: number) {
    return !!this.getKeyframeAt(boneName, frameId);
  }

  setKeyframeAt (boneName: BoneName, frameId: number, transform: Transform) {
    const timeline = this.getTimeline(boneName);
    const newTimeline: Timeline = [
      ...removeKeyframeAt(timeline, frameId),
      createKeyframe(frameId, transform),
    ];
    this.setTimeline(boneName, sortBy(newTimeline, ['frameId']));
  }

  deleteKeyframe (boneName: BoneName, frameId: number) {
    console.log(`would delete keyframe ${boneName}[${frameId}]`);
    const timeline = this.getTimeline(boneName);
    this.setTimeline(boneName, removeKeyframeAt(timeline, frameId));
  }

  getKeyframeAt (boneName: BoneName, frameId: number) {
    const timeline = this.getTimeline(boneName);
    return timeline.find(keyframe => keyframe.frameId === frameId);
  }

  getKeyframeBefore (boneName: BoneName, frameId: number, allowExact = true) {
    const timeline = this.getTimeline(boneName);
    return findLast(timeline, isKeyframeBefore(frameId, allowExact));
  }

  getKeyframeAfter (boneName: BoneName, frameId: number, allowExact = true) {
    const timeline = this.getTimeline(boneName);
    return find(timeline, isKeyframeAfter(frameId, allowExact));
  }

}
