// TODO class RenderPackage#setDrawParams etc.

import {
  requestAnimFrame,
  handleResize,
  createWebGlContext,
  Shader,
  Vao, VaoAttrInit,
  setUniforms,
  DrawParameters
} from './gl-utils';
import {CameraFPS} from './viewport/camera-fps';
import {RenderPackage, GlState, ObjectGeometry} from './viewport/RenderPackage';
import {getBoneTransforms} from './viewport/skeleton';
import {mat4} from 'gl-mat4';


const canvas = document.getElementById('anim-canvas') as HTMLCanvasElement;
const gl = createWebGlContext(canvas, {});
const camera = new CameraFPS(canvas);
const CAMERA_MOVE_SPEED = 0.02; // depends on scale etc.
const CAMERA_ROTATE_SPEED = 0.025 / 6;

const glState = (() => { // init function
  /* tslint:disable */
  const vertices = [
    -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
    -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
    -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
    1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
    -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
    -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1,
  ];

  const colors = [
      5,3,7, 5,3,7, 5,3,7, 5,3,7,
      1,1,3, 1,1,3, 1,1,3, 1,1,3,
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      1,1,0, 1,1,0, 1,1,0, 1,1,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0
   ];

  const indices = [
      0,1,2, 0,2,3, 4,5,6, 4,6,7,
      8,9,10, 8,10,11, 12,13,14, 12,14,15,
      16,17,18, 16,18,19, 20,21,22, 20,22,23
   ];
  /* tslint:enable */

  /*
  // buffers
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  const index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  */

  // Shaders
  // const vertCode = require('shaders/cube.vert.glsl');
  // const fragCode = require('shaders/cube.frag.glsl');
  const vertCode = require('shaders/skeleton.vert.glsl');
  const fragCode = require('shaders/skeleton.frag.glsl');

  const shader = new Shader(gl, vertCode, fragCode);
  if (!shader.isCreated()) {
   return;
  }

  /*
  // vao
  const vao = new Vao(gl, shader, [
    new VaoAttrInit('position', vertex_buffer, 0, 0),
    new VaoAttrInit('color', color_buffer, 0, 0),
  ]);
  if (!vao.isCreated()) {
    return;
  }
  */

  // let cubeGeo = new ObjectGeometry(vao, index_buffer, indices.length / 3);
  let cubeGeo = null;

  return new GlState(gl, shader, cubeGeo, null as any);
})();

const createRenderPackage = (deltaTime: number) => {
  const mov_matrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1];

  return {
    deltaTime,
    viewMatrix: camera.getViewMatrix(),
    projectionMatrix: camera.getProjectionMatrix(40, canvas.width, canvas.height),
    cameraPosition: camera.getPosition(),
    cubeModelMatrix: mov_matrix as any,
  } as RenderPackage;
};

const drawCube = (glState: GlState, pckg: RenderPackage) => {
  const {gl, cubeShader, cubeGeo, gltfGeo} = glState;
  if (!gltfGeo) { return; }
  // const {vao, indexBuffer, triangleCnt} = cubeGeo;
  const {vao, indexBuffer, triangleCnt} = gltfGeo;
  const {viewMatrix, projectionMatrix, cubeModelMatrix } = pckg;

  cubeShader.use(gl);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0.5, 0.5, 0.5, 0.9);
  gl.clearDepth(1.0);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  setUniforms(gl, cubeShader, {
    'g_Pmatrix': projectionMatrix, // camera.getProjectionMatrix(40, canvas.width, canvas.height),
    'g_Vmatrix': viewMatrix, // camera.getViewMatrix(),
    'g_Mmatrix': cubeModelMatrix, // mov_matrix,
  }, true);

  const nBones = 10;
  const tra = getBoneTransforms(0.0, nBones);
  tra.forEach((mat: mat4, i: number) => {
    const name = `g_BoneTransforms[${i}]`;
    const location = gl.getUniformLocation(cubeShader.glId, name);
    gl.uniformMatrix4fv(location, false, mat);
  });


  // TODO bind Vao too
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, triangleCnt * 3, gl.UNSIGNED_SHORT, 0);
};

let timeOld = 0;
const onDraw = (time: number) => {
  handleResize(gl);

  let dt = time - timeOld;
  timeOld = time;

  // update state etc.
  camera.update(dt, CAMERA_MOVE_SPEED, CAMERA_ROTATE_SPEED);

  // draws
  const renderPackage = createRenderPackage(dt);
  drawCube(glState, renderPackage);

  // fin
  requestAnimFrame(onDraw);
};


if (gl) {
  onDraw(0);
}


import { GltfLoader } from 'gltf-loader-ts';

// let uri = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF/BoxTextured.gltf';
let uri = require('assets/LampAnimScene.glb');

(async () => {
  const BYTES_IN_SHORT = 2;

  let loader = new GltfLoader();
  let asset = await loader.load(uri);
  console.log({asset});
  let gltf = asset.gltf;
  console.log({gltf});

  const cube = await gltf.meshes[0];
  console.log({cube});
  const cubeAttrs = cube.primitives[0].attributes;
  for (let attr in cubeAttrs) {
    console.log(`Attr ${attr} (idx: ${cubeAttrs[attr]})`); // refers to accessors
  }

  // `data` can be bound via `gl.BindBuffer`,
  let dataPos = await asset.accessorData(cubeAttrs.POSITION); // 3*(F32=5126)
  // let dataNormal = await asset.accessorData(cubeAttrs.NORMAL);
  let dataBoneIds = await asset.accessorData(cubeAttrs.JOINTS_0); // 4*(U16=5123)
  let dataWeights = await asset.accessorData(cubeAttrs.WEIGHTS_0); // 4*(F32=5126)
  console.log(`vertices = ${dataPos.length/4/3} = ${dataBoneIds.length/BYTES_IN_SHORT/4} = ${dataWeights.length/4/4}`);
  // console.log('dataPos: ', dataPos);
  console.log('dataBoneIds: ', dataBoneIds);
  // console.log('dataWeights: ', dataWeights);

  // bone indices are ints (actually unsigned shorts = 5123). Webgl shaders
  // do no accept ints/shorts. We have to convert all to floats.
  // e.g. for 72 vertices there are (72[vertices] * 4[boneInfluence/vertex] = 284[boneInfluence])
  // First reinterpret raw bytes as Uint16
  console.log(`dataBoneIds:raw (byteLength=${dataBoneIds.byteLength}, byteOffset=${dataBoneIds.byteOffset}, length=${dataBoneIds.length}) `, dataBoneIds.buffer);
  const dataBoneIdsAsUint16 = new Uint16Array(dataBoneIds.buffer, dataBoneIds.byteOffset, dataBoneIds.length / BYTES_IN_SHORT);
  console.log('dataBoneIds:i : ', dataBoneIdsAsUint16);
  const dataBoneIdsAsF32 = Float32Array.from(dataBoneIdsAsUint16, (n: number) => n + 0.5); // add half to correct rounding errors e.g. 1:u32 -> 0.99:f32 -> 0:u32
  console.log('dataBoneIds:f : ', dataBoneIdsAsF32);
  // accessor properties can be used with `gl.VertexAttribPointer`
  // let attr = gltf.accessors[posAttrIdx]; // and the
  // console.log({attr});

  // vao TODO minimize API?
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, dataPos, gl.STATIC_DRAW); // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  const boneIds_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boneIds_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, dataBoneIdsAsF32, gl.STATIC_DRAW);
  const weights_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, weights_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, dataWeights, gl.STATIC_DRAW);
  const vao = new Vao(gl, glState.cubeShader, [
    new VaoAttrInit('a_Position', vertex_buffer, 0, 0),
    new VaoAttrInit('a_BoneIDs', boneIds_buffer, 0, 0),
    new VaoAttrInit('a_Weights', weights_buffer, 0, 0)
    // TODO verify ints are set correctly
  ]);

  // indices
  const indicesIdx = cube.primitives[0].indices;
  const indicesAccesor = gltf.accessors[indicesIdx]; // UNSIGNED_BYTE?
  const indices = await asset.bufferViewData(indicesAccesor.bufferView);
  const index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  // this causes change of index buffer etc. in cube draw

  const idxCnt = indicesAccesor.count;
  // console.log(`indices(${idxCnt}), triangles (${idxCnt/3}), quads(${idxCnt/6}), cubes(${idxCnt/6/6}) not known #vertices, cause indexing + raw data`);
  glState.gltfGeo = new ObjectGeometry(vao, index_buffer, idxCnt / 3);
})();
