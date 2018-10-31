export {isAxisAllowed, isAnyAxisAllowed} from './constraints';
export {BoneConfigEntry} from './boneConfig';


/// SCENE

// test object: simple mesh to test skinning
// export const GLTF_URL = require('assets/TestScene.glb');
// export const LAMP_ROOT_NODE = 'SkeletonTest_rig';
// import {BONE_CONFIG} from './TestScene.cfg';

// final object
export const GLTF_URL = require('assets/LampAnimScene.glb');
export const LAMP_ROOT_NODE = 'Armature.001';
import {BONE_CONFIG} from './LampAnimScene.cfg';

/// END: SCENE


import {getBoneConfig as getBoneConfig_} from './boneConfig';
export const getBoneConfig = getBoneConfig_(BONE_CONFIG);


export const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
  MARKER_VERT: require('shaders/marker.vert.glsl'),
  MARKER_FRAG: require('shaders/marker.frag.glsl'),
  GIZMO_VERT: require('shaders/gizmo.vert.glsl'),
  GIZMO_FRAG: require('shaders/lampShader.frag.glsl'),
};


export const CAMERA_SETTINGS = {
  fovDgr: 90,
  zNear: 0.1,
  zFar: 100,
};
