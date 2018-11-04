import {Axis, Transform, POS_ROT_SCALE_0} from 'gl-utils';
import {Constraints, ALLOW_ALL, DISALLOW_ALL} from './constraints';

// this file contains descriptor of scene.
// tightly coupled to .glb file.
// we have to specify constraints, default frame etc.


export interface BoneConfigEntry {
  name: string;
  keyframe0: Transform; // default values
  constraints: Constraints;
  /// swap rotation axis cause blender gltf exporter...
  /// (literary after clicking on rotate Axis.Y we will
  ///  rotate on Axis.X and it will look good)
  blenderExporterRotationAxisFix: [Axis, Axis, Axis];
}

export const DEFAULT_CFG_VALUES = {
  name: 'bone-not-found',
  keyframe0: POS_ROT_SCALE_0,
  constraints: {
    position: ALLOW_ALL,
    rotation: ALLOW_ALL,
    scale:    DISALLOW_ALL,
  },
  // blenderExporterRotationAxisFix: [Axis.AxisX, Axis.AxisY, Axis.AxisZ],
} as BoneConfigEntry;


// I'd rather not expose content of config files as gigantic JSON
export const getBoneConfig = (boneConfig: BoneConfigEntry[]) => (boneName: string) => {
  return boneConfig.find(c => c.name === boneName) || DEFAULT_CFG_VALUES;
};
