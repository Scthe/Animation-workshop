import {GltfAsset, gltf} from 'gltf-loader-ts';
import {fromValues as vec3_Create} from 'gl-vec3';
import {fromValues as quat_Create} from 'gl-quat';
import {create as mat4_Create} from 'gl-mat4';

import {Bone, fillBindMatrices} from 'viewport/armature';
import {POSITION_0, ROTATION_0, SCALE_0} from 'viewport/animation';


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

const createBoneData = (node: gltf.Node) => {
  // can't use spread for non `func (args: Type[])` in TS
  // (spread has unknown args count, which does not typecheck well)
  const tra = node.translation ? vec3_Create.apply(null, node.translation) : POSITION_0;
  const rot = node.rotation ? quat_Create.apply(null, node.rotation) : ROTATION_0;
  const scale = node.scale ? vec3_Create.apply(null, node.scale) : SCALE_0;

  return {
    bindMatrix: mat4_Create(),
    inverseBindMatrix: mat4_Create(),
    translation: tra,
    rotation: rot,
    scale: scale,
  };
};


// nodeName is name of node that contains 'skin' key
export const loadBones = (asset: GltfAsset, node: gltf.Node) => {
  const gltf = asset.gltf;
  const skin = gltf.skins[node.skin];

  const getBoneIdxForNodeId = (nodeId: number) => {
    // search skin.joints for the same nodeId
    return skin.joints.findIndex((boneNodeId: number) => boneNodeId === nodeId);
  };

  const bones = skin.joints.map((nodeId: number) => {
    const node = gltf.nodes[nodeId];

    return new Bone (
      node.name,
      getExistingChildren(node, getBoneIdxForNodeId),
      createBoneData(node),
    );
  });

  fillBindMatrices(bones);

  return bones;
};
