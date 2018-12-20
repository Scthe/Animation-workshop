import {fromValues as vec3_Create} from 'gl-vec3';
export {isAxisAllowed, isAnyAxisAllowed, getActionableGizmo} from './constraints';
export {BoneConfigEntry} from './boneConfig';

export const SCENE_FILES = [
  { object: 'LampObj', filePath: require('assets/LampObject.glb') },
  { object: 'BallObj', filePath: require('assets/BallObject.glb') },
];

export const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
  MARKER_VERT: require('shaders/marker.vert.glsl'),
  MARKER_FRAG: require('shaders/marker.frag.glsl'),
  GIZMO_VERT: require('shaders/gizmo.vert.glsl'),
  GIZMO_FRAG: require('shaders/gizmo.frag.glsl'),
  GRID_VERT: require('shaders/grid.vert.glsl'),
  GRID_FRAG: require('shaders/grid.frag.glsl'),
};


export const CAMERA_SETTINGS = {
  fovDgr: 70,
  zNear: 0.1,
  zFar: 100,
};
export const CAMERA_POSITION = vec3_Create(0, 1.5, 4);


//
// Bone and armature config:
import {BONE_CONFIG} from './LampAnimScene.cfg';
import {DEFAULT_CFG_VALUES} from './boneConfig';

export const getBoneConfig = (boneName: string) => {
  return BONE_CONFIG.find(c => c.name === boneName) || DEFAULT_CFG_VALUES;
};
