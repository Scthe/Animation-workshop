import {Axis} from 'gl-utils';
import {Constraints, ALLOW_ALL, DISALLOW_ALL, allowOnly} from './constraints';
import {Transform, POS_ROT_SCALE_0} from 'viewport/animation';

// this file contains descriptor of scene.
// tightly coupled to .glb file.
// we have to specify constraints, default frame etc.

export interface BoneConfigEntry {
  name: string;
  keyframe0: Transform; // default values
  constraints: Constraints;
}


const boneConfigs = [

  {
    name: 'SkeletonTest_rig_B_root',
    keyframe0: POS_ROT_SCALE_0,
    constraints: {
      position: ALLOW_ALL,
      rotation: ALLOW_ALL,
      scale:    DISALLOW_ALL,
    },
  },

  {
    name: 'SkeletonTest_rig_B_1',
    keyframe0: POS_ROT_SCALE_0,
    constraints: {
      position: allowOnly(Axis.AxisY),
      rotation: allowOnly(Axis.AxisY),
      scale:    DISALLOW_ALL,
    },
  },

  {
    name: 'SkeletonTest_rig_B_2',
    keyframe0: POS_ROT_SCALE_0,
    constraints: {
      position: DISALLOW_ALL,
      rotation: allowOnly(Axis.AxisY),
      scale:    DISALLOW_ALL,
    },
  },

] as BoneConfigEntry[];

boneConfigs.forEach(c => Object.freeze(c));


// I'd rather not expose content of this file as gigantic JSON
export const getBoneConfig = (boneName: string) => {
  return boneConfigs.find(c => c.name === boneName);
};
