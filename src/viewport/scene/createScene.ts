import {GltfLoader} from 'gltf-loader-ts';
import {Shader, AxisList, Vao, VaoAttrInit} from 'gl-utils';

import {CameraFPS} from 'viewport/camera-fps';
import {AXIS_COLORS} from 'viewport/gizmo';
import {GlState} from 'viewport/GlState';
import {Marker, MarkerType} from 'viewport/marker';
import {Scene} from './index';
import {generateMoveGizmo, generateRotateGizmo} from './_generateGizmoMeshes';
import {loadObject, LoadObjectOpts} from './loader/loadObject';

import {
  SCENE_FILES, SHADERS,
  CAMERA_SETTINGS, CAMERA_POSITION
} from './config';


const MARKER_VAO_SIZE = 256; // see also MAX_MARKERS in marker.vert.glsl

const createInstancingVao = (gl: Webgl, shader: Shader, size: number) => {
  const data = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = i;
  }

  return new Vao(gl, shader, [
    new VaoAttrInit('a_VertexId_f', data, 0, 0),
  ]);
};

const createMarkerMeta = (gl: Webgl) => {
  const shader =  new Shader(gl, SHADERS.MARKER_VERT, SHADERS.MARKER_FRAG);
  const instancingVAO = createInstancingVao(gl, shader, MARKER_VAO_SIZE);
  return { shader, instancingVAO, };
};

const createGizmoMeta = (gl: Webgl) => {
  const markers = AxisList.map(axis => new Marker(MarkerType.Gizmo, {
    owner: axis,
    color: AXIS_COLORS[axis],
  }));

  const shader = new Shader(gl, SHADERS.GIZMO_VERT, SHADERS.GIZMO_FRAG);
  const moveMesh = generateMoveGizmo(gl, shader);
  const rotateMesh = generateRotateGizmo(gl, shader);

  return {
    shader,
    moveMesh,
    rotateMesh,
    markers,
  };
};

interface FileDescriptor {
  object: string;
  filePath: string;
}

const readObjectFile = (loadObjectOpts: LoadObjectOpts) => async (fileDesc: FileDescriptor) => {
  const {object, filePath} = fileDesc;
  const loader = new GltfLoader();
  const asset = await loader.load(filePath);
  console.log('asset.gltf', asset.gltf);

  const loadOpts = {
    ...loadObjectOpts,
    asset,
  };
  return loadObject(object, loadOpts);
};

export const createScene = async (glState: GlState) => {
  const {gl} = glState;
  const materialWithArmature = new Shader(gl, SHADERS.LAMP_VERT, SHADERS.LAMP_FRAG);

  const camera = new CameraFPS(CAMERA_SETTINGS, glState.canvas, CAMERA_POSITION);

  const loadObjectOpts = { gl, shader: materialWithArmature, asset: undefined as any };
  const objects = await Promise.all(
    SCENE_FILES.map(readObjectFile(loadObjectOpts))
  );

  return new Scene(
    glState,
    camera,
    materialWithArmature,
    objects,
    createMarkerMeta(gl),
    createGizmoMeta(gl),
  );
};
