import {
  mat4, create as mat4_Create, identity,
  multiply
} from 'gl-mat4';
import {fromValues as vec3_Create, add} from 'gl-vec3';
import {create as quat_Create, multiply as qMul} from 'gl-quat';
import {AnimState} from '../main';
import {getMove, getRotation} from '../../UI_State';
import {Armature} from './index';
import {createModelMatrix} from '../../gl-utils';

/*
 *  In this file we update bone matrices for animation.
 *
 *  NOTE: 'bind' always refers to bind pose (e.g. T-pose)
 *
 *  Nice math overviews:
 *    * http://ogldev.atspace.co.uk/www/tutorial38/tutorial38.html
 *    * https://www.reddit.com/r/opengl/comments/4pu7hq/question_about_skeletal_animations/
 *    * https://youtu.be/F-kcaonjHf8?t=3m23s
 */

// some util struct to ease moving params
interface BoneTransformsCfg {
  animState: AnimState;
  bones: Armature;
  transforms: mat4[];
}

// get animation matrix for bone
const getAnimationTransform = (cfg: BoneTransformsCfg, boneId: number) => {
  const bone = cfg.bones[boneId];
  const marker = {name: bone.name} as any;

  const translation = vec3_Create(0, 0, 0);
  const deltaFromAnim = getMove(marker);
  add(translation, bone.translation, deltaFromAnim);

  const rotation = quat_Create();
  const qAnim = getRotation(marker);
  qMul(rotation, qAnim, bone.rotation);

  const scale = 0.95;
  return createModelMatrix(translation, rotation, scale);
};

/*
 * calculate bone and children (recursively)
 *
 * matrices order (reversed multiplication order cause opengl):
 * 1. inverseBindMatrix - bring vertices to bone's local space
 *      In other words transformation: bindPosition->(0,0,0).
 *      In implementation, combination of BONE_BIND_MATRIX and PARENT'S_BONE_BIND_MATRIX.
 * 2. animationTransform - current local transform for this animation frame.
 *      if identity is given here, bone will land at (0,0,0) with no rotation.
 *      'true' identity is achieved if bind matrix is given here.
 *      In other words, this matrix must move from (0,0,0) to expected bone
 *      position/rotaton/scale
 * 3. parentTransfrom - this acts as local->global space transformation
 *      Look up how we calculated inverseBindMatrix
 */
const calculateBone = (cfg: BoneTransformsCfg, boneId: number, parentTransfrom: mat4) => {
  const {bones, transforms} = cfg;
  const bone = bones[boneId];

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
}
*/
