import {GltfAsset, gltf} from 'gltf-loader-ts';
import {mat4, invert} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {fromValues as quat_Create} from 'gl-quat';
import {BYTES} from '../gl-utils';
import {Bone} from './Armature';

const MAT4_ELEMENTS = 16;
const DEFAULT_TRANSLATION = vec3_Create(0, 0, 0);
const DEFAULT_ROTATION = quat_Create(0, 1, 0, 0);
const DEFAULT_SCALE = vec3_Create(1, 1, 1);

const getSkinByNodeName = (asset: GltfAsset, name: string) => {
  const gltf = asset.gltf;
  const node = gltf.nodes.filter(n => n.name === name)[0];
  return node && node.skin !== undefined ?  gltf.skins[node.skin] : undefined;
};

const createBone = (node: gltf.Node, invBindMat: mat4, getBoneIdxForNodeId: Function) => {
  const bindMat = new Float32Array(16);
  invert(bindMat, invBindMat);

  const children: number[] = [];
  if (node.children) {
    node.children.forEach(nodeId => {
      const boneIdx = getBoneIdxForNodeId(nodeId);
      if (boneIdx !== undefined) { children.push(boneIdx); }
    });
  }

  const tra = node.translation ? vec3_Create.apply(null, node.translation) : DEFAULT_TRANSLATION;
  const rot = node.rotation ? quat_Create.apply(null, node.rotation) : DEFAULT_ROTATION;
  const scale = node.scale ? vec3_Create.apply(null, node.scale) : DEFAULT_SCALE;

  return new Bone(node.name, bindMat, invBindMat, children, tra, rot, scale);
};

// nodeName is name of node that contains 'skin' key
export const readArmature = async (asset: GltfAsset, nodeName: string) => {
  const skin = getSkinByNodeName(asset, nodeName);
  const dataRaw = await asset.bufferViewData(skin.inverseBindMatrices);

  const getBoneIdxForNodeId = (nodeId: number) => {
    // search skin.joints for the same nodeId
    const reducer = (acc: number, boneNodeId: number, idx: number) =>
      boneNodeId === nodeId ? idx : acc;
    return skin.joints.reduce(reducer, undefined as number);
  };

  let bufferOffset = 0;
  const bones = skin.joints.map((nodeId: number) => {
    const node = asset.gltf.nodes[nodeId];
    const invBindMat = new Float32Array(dataRaw.buffer, dataRaw.byteOffset + bufferOffset, MAT4_ELEMENTS);
    bufferOffset += MAT4_ELEMENTS * BYTES.FLOAT;

    return createBone(node, invBindMat, getBoneIdxForNodeId);
  });

  return bones;
};
