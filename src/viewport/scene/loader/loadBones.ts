import {GltfAsset, gltf} from 'gltf-loader-ts';
import {mat4, create as mat4_Create, invert} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {fromValues as quat_Create} from 'gl-quat';
import {BYTES} from 'gl-utils';
import {Bone} from 'viewport/armature';
import {POSITION_0, ROTATION_0, SCALE_0} from 'viewport/animation';

const MAT4_ELEMENTS = 16;

const getExistingChildren = (node: gltf.Node, getBoneIdxForNodeId: Function) => {
  const children: number[] = [];

  if (node.children) {
    node.children.forEach(nodeId => {
      const boneIdx = getBoneIdxForNodeId(nodeId);
      if (boneIdx !== -1) { children.push(boneIdx); }
    });
  }

  return children;
};

const createBone = (node: gltf.Node, invBindMat: mat4, getBoneIdxForNodeId: Function) => {
  const bindMat = mat4_Create();
  invert(bindMat, invBindMat);

  const tra = node.translation ? vec3_Create.apply(null, node.translation) : POSITION_0;
  const rot = node.rotation ? quat_Create.apply(null, node.rotation) : ROTATION_0;
  const scale = node.scale ? vec3_Create.apply(null, node.scale) : SCALE_0;

  return new Bone (
    node.name, getExistingChildren(node, getBoneIdxForNodeId),
    {
      bindMatrix: bindMat,
      inverseBindMatrix: invBindMat,
      translation: tra,
      rotation: rot,
      scale: scale,
    },
    mat4_Create(),
  );
};

// nodeName is name of node that contains 'skin' key
export const loadBones = async (asset: GltfAsset, node: gltf.Node) => {
  const gltf = asset.gltf;
  const skin = gltf.skins[node.skin];
  const dataRaw = await asset.bufferViewData(skin.inverseBindMatrices);

  const getBoneIdxForNodeId = (nodeId: number) => {
    // search skin.joints for the same nodeId
    return skin.joints.findIndex((boneNodeId: number) => boneNodeId === nodeId);
  };

  let bufferOffset = 0;
  return skin.joints.map((nodeId: number) => {
    const node = gltf.nodes[nodeId];
    const invBindMat = new Float32Array(dataRaw.buffer, dataRaw.byteOffset + bufferOffset, MAT4_ELEMENTS);
    bufferOffset += MAT4_ELEMENTS * BYTES.FLOAT;

    return createBone(node, invBindMat, getBoneIdxForNodeId);
  });
};
