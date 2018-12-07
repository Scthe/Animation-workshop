import {Transform, createInitTransform} from 'gl-utils';
import {Keyframe, Timeline} from 'viewport/animation';
import {TimelineMap} from '../TimelineState';

const tryOr = <T>(f: () => T, alt: T): T => {
  let v: T = alt;
  try {
    v = f();
  } catch (ex) {
    console.log(`[(De?)serialize error] ${ex}`);
  }
  return v;
};

interface SerializedTransform {
  position: number[];
  rotation: number[];
}

interface SerializedKeyframe {
  frameId: number;
  transform: SerializedTransform;
}

type SerializedTimeline = SerializedKeyframe[];
type SerializedTimelineMap = {[key: string]: SerializedTimeline};

const setF32 = (buf: Float32Array, vals: number[]) => {
  for (let i = 0; i < buf.length; i++) {
    buf[i] = vals[i];
  }
};

const deserializeTransform = (stfx: SerializedTransform): Transform => {
  const transform = createInitTransform();
  setF32(transform.position, stfx.position);
  setF32(transform.rotation, stfx.rotation);
  return transform;
};

const deserializeKeyframe = (skf: SerializedKeyframe): Keyframe => ({
  frameId: skf.frameId,
  transform: deserializeTransform(skf.transform),
});

const deserializeTimeline = (stl: SerializedTimeline): Timeline => {
  const result = [] as Timeline;

  stl.forEach(skf => {
    const kf = tryOr(() => deserializeKeyframe(skf), undefined);
    if (kf) {
      result.push(kf);
    }
  });

  return result;
};


const DESERIALIZE_DEFAULT = {};

const deserializeImpl = (timelines: SerializedTimelineMap): TimelineMap => {
  if (!timelines) {
    return DESERIALIZE_DEFAULT;
  }

  const result: TimelineMap = {};

  Object.keys(timelines).forEach(boneName => {
    result[boneName] = tryOr(
      () => deserializeTimeline(timelines[boneName]), []
    );
  });

  return result;
};

export const deserialize = (jsonStr: string): TimelineMap => tryOr(() => {
  if (!jsonStr) {
    return DESERIALIZE_DEFAULT;
  }
  const json = JSON.parse(jsonStr);
  return deserializeImpl(json.timelines);
}, DESERIALIZE_DEFAULT);

export const serialize = (jsonObj: object) =>
  tryOr(() => JSON.stringify(jsonObj), undefined);
