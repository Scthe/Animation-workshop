import {vec3} from 'gl-vec3';
import {quat} from 'gl-quat';
import {Axis} from 'gl-utils';
import {Constraints, ALLOW_ALL, DISALLOW_ALL, allowOnly} from './constraints';
import {POS_ROT_SCALE_0} from 'viewport/animation';

// this file contains descriptor of scene
// tightly coupled to .glb file
// we have to specify constraints, default frame etc.



interface PosRotScale {
  position: vec3;
  rotation: quat;
  scale: vec3;
}

export interface BoneConfigEntry {
  name: string;
  keyframe0: PosRotScale; // default values
  constraints: Constraints;
}

export const CONFIG = {
  'BoneLowerArm': {
    name: 'BoneLowerArm',
    keyframe0: POS_ROT_SCALE_0,
    constraints: {
      position: ALLOW_ALL,
      rotation: allowOnly(Axis.AxisY),
      scale:    DISALLOW_ALL,
    },
  } as BoneConfigEntry,
};
