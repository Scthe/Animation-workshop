import {GltfAsset, GltfLoader} from 'gltf-loader-ts';
import {Shader} from 'gl-utils';
import {CameraFPS} from 'viewport/camera-fps';
import {Scene, getNode, loadBones, loadMesh} from 'viewport/scene';
import {isMeshNode} from 'viewport/scene/loader/_utils';
import {create as mat4_Create} from 'gl-mat4';
import {GlState} from 'viewport/GlState';


const CAMERA_SETTINGS = {
  fovDgr: 90,
  zNear: 0.1,
  zFar: 100,
};

const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
};
const GLTF_URL = require('assets/TestScene.glb');
const LAMP_ROOT_NODE = 'SkeletonTest_rig';


const getMeshNode = (asset: GltfAsset, rootNodeName: string) => {
  const gltf = asset.gltf;
  const rootNode = getNode(asset, rootNodeName);
  const childNodes = rootNode.children.map((idx: number) => gltf.nodes[idx]);
  return childNodes.filter(isMeshNode)[0];
};

export const createScene = async (glState: GlState) => {
  const {gl} = glState;
  const materialWithArmature = new Shader(gl, SHADERS.LAMP_VERT, SHADERS.LAMP_FRAG);

  const loader = new GltfLoader();
  const asset = await loader.load(GLTF_URL);
  const meshNode = getMeshNode(asset, LAMP_ROOT_NODE);

  const lampBones = await loadBones(asset, meshNode);
  const lampMesh = await loadMesh(gl, materialWithArmature, asset, meshNode.mesh, {
    'POSITION': 'a_Position',
    'JOINTS_0': 'a_BoneIDs',
    'WEIGHTS_0': 'a_Weights',
  });

  const camera = new CameraFPS(CAMERA_SETTINGS);

  return new Scene(
    glState,
    camera,
    materialWithArmature,
    {mesh: lampMesh, bones: lampBones, modelMatrix: mat4_Create()},
  );
};
