import {generatePlane, createGpuShape, DrawParameters, Shader, setUniforms, CullingMode} from 'gl-utils';
import {fromValues as vec3_Create} from 'gl-vec3';
import {create as mat4_Create, scale} from 'gl-mat4';
import {GlState} from './GlState';
import {Scene, Mesh, SHADERS} from './scene';
import {drawMesh} from './drawObject3d';

const SHADER_ATTR_NAME = 'a_Position';

const MODEL_SCALE_F = 10;
const DENSITY_MAJOR = 20.0;
const DENSITY_MINOR = 4.0;
// folowing are blending func. specific
const COLOR_MAJOR = 0.6;
const COLOR_MINOR = 1.0;

const GRID_MODEL_MATRIX = (() => {
  const vec3_scale = vec3_Create(MODEL_SCALE_F, MODEL_SCALE_F, MODEL_SCALE_F);
  const modelMatrix = mat4_Create();
  return scale(modelMatrix, modelMatrix, vec3_scale);
})();

// I'm lazy
let tmpPlaneMesh: Mesh;
let tmpPlaneShader: Shader;

export const createGridMesh = (gl: Webgl) => {
  if (gl.getExtension('OES_standard_derivatives') === null) {
    throw `Webgl extension 'OES_standard_derivatives' is not supported. How even?`;
  }

  tmpPlaneShader = new Shader(gl, SHADERS.GRID_VERT, SHADERS.GRID_FRAG);

  const shape = generatePlane({ width: 2, height: 2});
  tmpPlaneMesh = {
    ...createGpuShape(gl, shape, tmpPlaneShader, SHADER_ATTR_NAME),
    material: undefined as any,
  };
};

export const drawGridMesh = (gl: Webgl, glState: GlState, scene: Scene) => {
  const dp = new DrawParameters();
  dp.depth.write = false;
  dp.culling = CullingMode.None;
  glState.setDrawState(dp);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  tmpPlaneShader.use(gl);

  const mvp = scene.getMVP(GRID_MODEL_MATRIX);
  const setGridUniforms = (density: number, color: number) => {
    setUniforms(gl, tmpPlaneShader, {
      'g_color': vec3_Create(color, color, color),
      'g_gridDensity': density,
      'g_MVP': mvp,
    }, true);
  };

  setGridUniforms(DENSITY_MAJOR, COLOR_MAJOR);
  drawMesh(gl, tmpPlaneShader)(tmpPlaneMesh);

  setGridUniforms(DENSITY_MINOR, COLOR_MINOR);
  drawMesh(gl, tmpPlaneShader)(tmpPlaneMesh);

  gl.disable(gl.BLEND);
};
