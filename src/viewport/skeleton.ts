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

// http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html
// https://www.reddit.com/r/opengl/comments/4pu7hq/question_about_skeletal_animations/
// https://youtu.be/F-kcaonjHf8?t=3m23s
// 'bind' always refers to bind pose (e.g. T-pose)

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

  let rotation = bone.rotation;
  if (boneId === 1) {
    // TEST: given boneLocalRotation, compose it with other rotation
    // (normally, You would replace instead of composing)
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
  //      In other words transformation: bindPosition->(0,0,0).
  //      In implementation, combination of boneBindMatrix and parent's boneBindMatrix.
  // 2. animationTransform - current transfrom to REPLACE bindMatrix with.
  //      if identity is given here, bone will land at (0,0,0) with no rotation.
  //      'true' identity is achieved if bind matrix is given here.
  //      In other words, this matrix must move from (0,0,0) to final bone
  //      position/rotaton/scale, where final means e.g. shoulder position
  // 3. parentTransfrom - this acts as local->global space transformation
  //      Look up how we calculated inverseBindMatrix
  const animationTransform = getAnimationTransform(cfg, boneId);
  const globalTransform = mat4_Create();
  transforms[boneId] = mat4_Create();
  multiply(globalTransform, parentTransfrom, animationTransform);
  multiply(transforms[boneId], globalTransform, bone.inverseBindMatrix);

  bone.children.forEach(childIdx => {
    calculateBoneTransforms(cfg, childIdx, globalTransform);
  });
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
