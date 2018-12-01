import {fromValues as vec3_Create} from 'gl-vec3';
import {POS_ROT_SCALE_0} from 'gl-utils';

import {BoneConfigEntry, DEFAULT_CFG_VALUES} from './boneConfig';

const LAMP_ARMATURE = 'LampArmature';
const BALL_ARMATURE = 'BallArmature';

export const BONE_CONFIG: BoneConfigEntry[] = [

  // lamp:
  {
    ...DEFAULT_CFG_VALUES,
    name: `${LAMP_ARMATURE}_bRoot`,
    keyframe0: {
      ...POS_ROT_SCALE_0,
      position: vec3_Create(1, 0, 0),
      // rotation: quat_Create(0, 0.999957, 0, -0.00920354), // has problem with camera behind object
    },
  },

  {
    ...DEFAULT_CFG_VALUES,
    name: `${LAMP_ARMATURE}_bLower`,
  },

  {
    ...DEFAULT_CFG_VALUES,
    name: `${LAMP_ARMATURE}_bUpper`,
  },

  {
    ...DEFAULT_CFG_VALUES,
    name: `${LAMP_ARMATURE}_bHead`,
  },

  // ball:
  {
    ...DEFAULT_CFG_VALUES,
    name: `${BALL_ARMATURE}_bBall`,
    keyframe0: {
      ...POS_ROT_SCALE_0,
      position: vec3_Create(0.5, 0.3, 0),
    },
  },

];

BONE_CONFIG.forEach(c => Object.freeze(c));
