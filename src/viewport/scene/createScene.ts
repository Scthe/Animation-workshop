import {GltfAsset, GltfLoader} from 'gltf-loader-ts';
import {create as mat4_Create} from 'gl-mat4';
import {Shader, AxisList, Vao, VaoAttrInit} from 'gl-utils';

import {CameraFPS} from 'viewport/camera-fps';
import {AXIS_COLORS} from 'viewport/gizmo';
import {GlState} from 'viewport/GlState';
import {Marker} from 'viewport/marker';
import {Scene, getNode, loadBones, loadMesh} from './index';
import {isMeshNode} from 'viewport/scene/loader/_utils';


const CAMERA_SETTINGS = {
  fovDgr: 90,
  zNear: 0.1,
  zFar: 100,
};

const SHADERS = {
  LAMP_VERT: require('shaders/lampShader.vert.glsl'),
  LAMP_FRAG: require('shaders/lampShader.frag.glsl'),
  MARKER_VERT: require('shaders/marker.vert.glsl'),
  MARKER_FRAG: require('shaders/marker.frag.glsl'),
};
const GLTF_URL = require('assets/TestScene.glb');
const LAMP_ROOT_NODE = 'SkeletonTest_rig';
const MARKER_VAO_SIZE = 255;


const getMeshNode = (asset: GltfAsset, rootNodeName: string) => {
  const gltf = asset.gltf;
  const rootNode = getNode(asset, rootNodeName);
  const childNodes = rootNode.children.map((idx: number) => gltf.nodes[idx]);
  return childNodes.filter(isMeshNode)[0];
};

const createInstancingVao = (gl: Webgl, shader: Shader, size: number) => {
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = i;
  }

  return new Vao(gl, shader, [
    new VaoAttrInit('a_VertexId_f', data, 0, 0),
  ]);
};

export const createScene = async (glState: GlState) => {
  const {gl} = glState;
  const materialWithArmature = new Shader(gl, SHADERS.LAMP_VERT, SHADERS.LAMP_FRAG);

  const loader = new GltfLoader();
  const asset = await loader.load(GLTF_URL);

  // lamp
  const meshNode = getMeshNode(asset, LAMP_ROOT_NODE);
  const lampBones = await loadBones(asset, meshNode);
  const lampMesh = await loadMesh(gl, materialWithArmature, asset, meshNode.mesh, {
    'POSITION': 'a_Position',
    'JOINTS_0': 'a_BoneIDs',
    'WEIGHTS_0': 'a_Weights',
  });

  // camera
  const camera = new CameraFPS(CAMERA_SETTINGS);

  // markers
  const markerMaterial =  new Shader(gl, SHADERS.MARKER_VERT, SHADERS.MARKER_FRAG);
  const instancingVAO = createInstancingVao(gl, markerMaterial, MARKER_VAO_SIZE);
  const gizmoMarkers = AxisList.map(axis => new Marker({
    owner: axis,
    color: AXIS_COLORS[axis],
  }));

  return new Scene(
    glState,
    camera,
    materialWithArmature,
    {mesh: lampMesh, bones: lampBones, modelMatrix: mat4_Create()},
    markerMaterial,
    instancingVAO,
    gizmoMarkers,
  );
};
