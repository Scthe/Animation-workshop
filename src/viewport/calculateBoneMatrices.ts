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
import {Armature} from './structs';
import {toRadians} from '../gl-utils';
import {AnimState} from './structs';

/*
  In this file we update bone matrices for animation.

  NOTE: 'bind' always refers to bind pose (e.g. T-pose)

  Nice math overviews:
    * http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html
    * https://www.reddit.com/r/opengl/comments/4pu7hq/question_about_skeletal_animations/
    * https://youtu.be/F-kcaonjHf8?t=3m23s
*/

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

const calculateBone = (cfg: BoneTransformsCfg, boneId: number, parentTransfrom: mat4) => {
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
    calculateBone(cfg, childIdx, globalTransform);
  });
};

export const calculateBoneMatrices = (animState: AnimState, bones: Armature) => {
  const root = mat4_Create();
  identity(root);

  const transforms: mat4[] = new Array(bones.length);
  const cfg = {
    animState,
    bones,
    transforms,
  };

  calculateBone(cfg, 0, root);
  return transforms;
};
