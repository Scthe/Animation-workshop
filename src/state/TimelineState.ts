import {observable, action, computed} from 'mobx';
import {Timeline, createKeyframe} from 'viewport/animation';
import {Transform} from 'gl-utils';
import {sortBy, cloneDeep, uniq, flatten} from 'lodash';

export const TIMELINE_DEFAULT = {};
Object.freeze(TIMELINE_DEFAULT);

export type TimelineMap = {[key: string]: Timeline};
type BoneName = string;


const removeKeyframeAt = (timeline: Timeline, frameId: number) =>
  timeline.filter(keyframe => keyframe.frameId !== frameId);

export class TimelineState {
  // all animation data
  @observable timelines: TimelineMap;

  constructor (initVal: TimelineMap) {
    this.timelines = cloneDeep(initVal);
  }

  @computed
  get framesWithKeyframe () {
    const getKeyframeIds = (t: Timeline) => t.map(kf => kf.frameId);
    const keyframeIdsMap = Object.keys(this.timelines).map(boneName =>
      getKeyframeIds(this.timelines[boneName])
    );
    return sortBy(uniq(flatten(keyframeIdsMap)));
  }

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

  @action
  setKeyframeAt (boneName: BoneName, frameId: number, transform: Transform) {
    const timeline = this.getTimeline(boneName);
    const newTimeline: Timeline = [
      ...removeKeyframeAt(timeline, frameId),
      createKeyframe(frameId, transform),
    ];
    this.setTimeline(boneName, sortBy(newTimeline, ['frameId']));
  }

  deleteKeyframe (boneName: BoneName, frameId: number) {
    const timeline = this.getTimeline(boneName);
    this.setTimeline(boneName, removeKeyframeAt(timeline, frameId));
  }

  getKeyframeAt (boneName: BoneName, frameId: number) {
    const timeline = this.getTimeline(boneName);
    return timeline.find(keyframe => keyframe.frameId === frameId);
  }

  reset (newState: TimelineMap = TIMELINE_DEFAULT) {
    this.timelines = cloneDeep(newState);
  }

}
