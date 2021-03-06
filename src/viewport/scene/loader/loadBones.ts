import {GltfAsset, gltf} from 'gltf-loader-ts';
import {fromValues as vec3_Create} from 'gl-vec3';
import {fromValues as quat_Create} from 'gl-quat';
import {create as mat4_Create} from 'gl-mat4';
import {POSITION_0, ROTATION_0, SCALE_0, Transform} from 'gl-utils';

import {Bone, fillBindMatrices} from 'viewport/armature';


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
    bindTransform: {
      position: tra,
      rotation: rot,
      scale: scale,
    } as Transform,
  };
};


export const loadBones = (asset: GltfAsset, skin: gltf.Skin) => {
  const gltf = asset.gltf;

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
