import {GltfAsset, gltf} from 'gltf-loader-ts';
import {create as mat4_Create} from 'gl-mat4';
import {Shader} from 'gl-utils';
import {Object3d} from '../Scene';
import {loadBones} from './loadBones';
import {loadMesh} from './loadMesh';

const SKINNED_MESH_ATTRS = {
  'POSITION': 'a_Position',
  'JOINTS_0': 'a_BoneIDs',
  'WEIGHTS_0': 'a_Weights',
};

interface LoadObjectOpts {
  gl: Webgl;
  shader: Shader;
  asset: GltfAsset;
}

const getObjNode = (asset: GltfAsset, objName: string) => {
  const nodes = asset.gltf.nodes.filter((n: gltf.Node) => n.name === objName);
  if (nodes.length !== 1) {
    throw `expected to find single object '${objName}', found ${nodes.length}`;
  }
  return nodes[0];
};

export const loadObject = (opts: LoadObjectOpts) => async (objName: string): Promise<Object3d> => {
  const gltf = opts.asset.gltf;
  const node = getObjNode(opts.asset, objName);

  const mesh = gltf.meshes[node.mesh];
  const skin = gltf.skins[node.skin];
  if (!mesh || !skin) {
    throw `expected that object will contain mesh and skin data: '${JSON.stringify(node)}'`;
  }

  const loadMeshOpts = {
    ...opts, attrMap: SKINNED_MESH_ATTRS,
  };
  const meshes = mesh.primitives.map(async p => {
    const m = await loadMesh(p, loadMeshOpts);
    console.log(`Mesh[${objName}]`, m);
    return m;
  });

  return {
    name: objName,
    meshes: await Promise.all(meshes),
    bones: loadBones(opts.asset, skin),
    modelMatrix: mat4_Create(),
  };
};
