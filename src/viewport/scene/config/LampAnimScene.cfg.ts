import {fromValues as vec3_Create} from 'gl-vec3';
import {Axis, POS_ROT_SCALE_0} from 'gl-utils';

import {BoneConfigEntry, DEFAULT_CFG_VALUES, createConstraints} from './boneConfig';
import {DISALLOW_ALL, allowOnly} from './constraints';

// this file contains descriptor of scene.
// tightly coupled to .glb file.
// we have to specify constraints, default frame etc.


const LAMP_ARMATURE = 'LampArmature';
const BALL_ARMATURE = 'BallArmature';

const CONSTRAINTS_LAMP_NECK = createConstraints({
  position: DISALLOW_ALL,
  rotation: allowOnly(Axis.AxisX),
});

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
    constraints: CONSTRAINTS_LAMP_NECK,
  },

  {
    ...DEFAULT_CFG_VALUES,
    name: `${LAMP_ARMATURE}_bUpper`,
    constraints: CONSTRAINTS_LAMP_NECK,
  },

  {
    ...DEFAULT_CFG_VALUES,
    name: `${LAMP_ARMATURE}_bHead`,
    constraints: CONSTRAINTS_LAMP_NECK,
  },

  // ball:
  {
    ...DEFAULT_CFG_VALUES,
    name: `${BALL_ARMATURE}_bBall`,
    keyframe0: {
      ...POS_ROT_SCALE_0,
      position: vec3_Create(-1.0, 0.3, 0),
    },
  },

];

BONE_CONFIG.forEach(c => Object.freeze(c));
