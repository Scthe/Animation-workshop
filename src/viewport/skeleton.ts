import {
  create as mat4_Create,
  identity,
  fromTranslation,
  mat4,
  multiply,
  fromRotationTranslation
} from 'gl-mat4';
import { fromValues as vec3_Create, vec3 } from 'gl-vec3';
import { create as quat_Create, rotateX } from 'gl-quat';
import {AnimState} from './doDraw';
import {Armature} from './GlState';
import {toRadians} from '../gl-utils';

interface BoneTransformsCfg {
  animState: AnimState;
  bones: Armature;
  transforms: mat4[];
}

/*
const getAnimationTransform = (cfg: BoneTransformsCfg, boneId: number) => {
  // Interpolate scaling and generate scaling transformation matrix
  aiVector3D Scaling;
  CalcInterpolatedScaling(Scaling, AnimationTime, pNodeAnim);
  Matrix4f ScalingM;
  ScalingM.InitScaleTransform(Scaling.x, Scaling.y, Scaling.z);

  // Interpolate rotation and generate rotation transformation matrix
  aiQuaternion RotationQ;
  CalcInterpolatedRotation(RotationQ, AnimationTime, pNodeAnim);
  Matrix4f RotationM = Matrix4f(RotationQ.GetMatrix());

  // Interpolate translation and generate translation transformation matrix
  aiVector3D Translation;
  CalcInterpolatedPosition(Translation, AnimationTime, pNodeAnim);
  Matrix4f TranslationM;
  TranslationM.InitTranslationTransform(Translation.x, Translation.y, Translation.z);

  // Combine the above transformations
  return TranslationM * RotationM * ScalingM;
}*/

const getAnimationTransform = (cfg: BoneTransformsCfg, boneId: number) => {
  const {animState, bones, transforms} = cfg;
  const bone = bones[boneId];
  const result = mat4_Create();

  // identity(result); // simple :)
  let rotation = bone.rotation;
  if (boneId === 1) {
    rotation = quat_Create();
    rotateX(rotation, bone.rotation, toRadians(animState.frameId % 360));
  }
  fromRotationTranslation(result, rotation, bone.translation);

  return result;
};

const calculateBoneTransforms = (cfg: BoneTransformsCfg, boneId: number, parentTransfrom: mat4) => {
  const {animState, bones, transforms} = cfg;
  const bone = bones[boneId];

  // matrices order (reversed multiplication order cause opengl):
  // 1. inverseBindMatrix - bring vertices to bone's local space
  // 2. animationTransform - current transfrom to replace bindMatrix
  // 3. parentTransfrom - this acts as local->global space transformation
  const animationTransform = getAnimationTransform(cfg, boneId);
  const globalTransform = mat4_Create();
  transforms[boneId] = mat4_Create();
  multiply(globalTransform, parentTransfrom, animationTransform);
  multiply(transforms[boneId], globalTransform, bone.inverseBindMatrix);

  if (boneId < bones.length - 1) { // TODO use children field
    calculateBoneTransforms(cfg, boneId + 1, globalTransform);
  }
};



// 0 - BoneBase
// 1 - BoneA
// 2 - BoneB

export const getBoneTransforms = (animState: AnimState, bones: Armature) => {
  const root = mat4_Create();
  identity(root);

  const transforms: mat4[] = new Array(bones.length);
  const cfg = {
    animState,
    bones,
    transforms,
  };

  calculateBoneTransforms(cfg, 0, root);
  return transforms;
};

/*
export const getBoneTransforms = (frameId: number, nBoneCount: number) => {
  const mm = mat4_Create();
  fromTranslation(mm, vec3_Create(0, 0.3, 0));

  const transforms = [];
  for (let i = 0; i < nBoneCount; i++) {
    let m = mat4_Create();
    identity(m);
    transforms.push(i === 0 ? mm : m);
  }
  return transforms;
};
*/
