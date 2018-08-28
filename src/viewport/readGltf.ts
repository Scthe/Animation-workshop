import {GltfLoader, GltfAsset} from 'gltf-loader-ts';
import {Shader, Vao, VaoAttrInit} from '../gl-utils';
import {ObjectGeometry} from './GlState';

const LAMP_MESH_NAME = 'Cube';

// no. of bytes in each primitive type
const BYTES = {
  FLOAT: 4,
  INT: 4,
  SHORT: 2
};

interface ShaderCollection {
  lampShader: Shader;
}

type TypedArrayConvertMapFn = (n: number) => number;

/**
  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
  *
  * Bone indices are ints (actually unsigned shorts = 5123). Webgl shaders
  * do no accept ints/shorts. We have to convert all to floats.
  * e.g. for 72 vertices there are (72[vertices] * 4[boneInfluence/vertex] = 284[boneInfluence])
  */
const convertBufferUnderlayingType = (buffer: Uint8Array, SourceType: Function, TargetType: Function,
  mapFn?: TypedArrayConvertMapFn
) => {
  mapFn = mapFn ? mapFn : (e: number) => e;

  // First reinterpret raw bytes as Uint16
  const dataBoneIdsAsUint16 = new (SourceType as any)(buffer.buffer, buffer.byteOffset, buffer.length / BYTES.SHORT);

  // map each of Uint16 to float
  return (TargetType as any).from(dataBoneIdsAsUint16, mapFn);
};

const getAttributeData = async (gl: Webgl, asset: GltfAsset, accessorId: number) => {
  const accessor = asset.gltf.accessors[accessorId];
  const rawData = await asset.accessorData(accessorId);

  // componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number
  switch (accessor.componentType) {
    case gl.FLOAT: // 5126
      return rawData; // will be accepted no problem
    case gl.UNSIGNED_SHORT: // 5123
      return convertBufferUnderlayingType(rawData, Uint16Array, Float32Array, (e: number) => e + 0.5); // add half to correct (maybe?) rounding errors e.g. (1:u32) -> (0.99:f32) -> (0:u32)
    case gl.BYTE: // 5120
    case gl.UNSIGNED_BYTE: // 5121
    case gl.SHORT: // 5122
    case gl.INT: // 5124
    case gl.UNSIGNED_INT: // 5125
    default:
      throw [
        `Unsupported gltf accessor component type ${accessor.componentType}.`,
        'Expected gl.FLOAT or gl.UNSIGNED_SHORT. This should not happen, as',
        'asset is part of repo' ].join(' ');
  }
};

const createIndexBuffer = async (gl: Webgl, asset: GltfAsset, indicesAccesorId: number) => {
  const gltf = asset.gltf;
  const accessor = gltf.accessors[indicesAccesorId];
  const dataRaw = await asset.bufferViewData(accessor.bufferView);

  // create webgl buffer
  const indexBufferGlId = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferGlId);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dataRaw, gl.STATIC_DRAW);
  if (accessor.componentType !== gl.UNSIGNED_BYTE) {
    throw `Unsupported index buffer component type (${accessor.componentType})`;
  }

  // const idxCnt = accessor.count;
  // console.log(`indices(${idxCnt}), triangles (${idxCnt/3}), quads(${idxCnt/6}), cubes(${idxCnt/6/6}) not known #vertices, cause indexing + raw data`);

  return {
    type: gl.UNSIGNED_BYTE,
    buffer: indexBufferGlId,
    triangleCnt: accessor.count / 3,
  };
};

// TODO use accessor-attribute => shader-attribute map (POSITION => a_Position)
const readLampObject = async (gl: Webgl, shader: Shader, asset: GltfAsset) => {
  const gltf = asset.gltf;
  const meshDesc = gltf.meshes.filter(e => e.name === LAMP_MESH_NAME)[0];
  if (!meshDesc) { throw `Could not find lamp object (looked for ${LAMP_MESH_NAME})`; }
  console.log(`mesh ${meshDesc.name}`, meshDesc);

  // each attribute refers to accessors
  const mesh = meshDesc.primitives[0]; // might as well
  const attributes = mesh.attributes;
  // for (let attr in attributes) {
    // console.log(`Attr ${attr} (idx: ${attributes[attr]})`);
  // }

  const dataPos = await getAttributeData(gl, asset, attributes.POSITION);
  const dataWeights = await getAttributeData(gl, asset, attributes.WEIGHTS_0);
  const dataBoneIds = await getAttributeData(gl, asset, attributes.JOINTS_0);
  // const dataNormal = await getAttributeData(gl, asset, attributes.NORMAL);

  console.log([
    'vertices',
    '= ' + (dataPos.length / BYTES.FLOAT / 3),     // vec3 === 3 * (F32=5126)
    '= ' + (dataBoneIds.length / BYTES.SHORT / 4), // svec4 === 4 * (U16=5123) // TODO this is in U16, not U8, will not match rest
    '= ' + (dataWeights.length / BYTES.FLOAT / 4), // vec4  === 4 * (F32=5126)
    // '= ' + (dataNormal.length / BYTES.FLOAT / 3),  // vec3 === 3 * (F32=5126)
  ].join(' '));

  // create vao
  const vao = new Vao(gl, shader, [
    new VaoAttrInit('a_Position', dataPos, 0, 0),
    new VaoAttrInit('a_BoneIDs', dataBoneIds, 0, 0),
    new VaoAttrInit('a_Weights', dataWeights, 0, 0)
  ]);

  // indices
  const indexBuffer = await createIndexBuffer(gl, asset, mesh.indices);

  return new ObjectGeometry(vao, indexBuffer.type, indexBuffer.buffer, indexBuffer.triangleCnt);
};

export const readGltf = async (gl: Webgl, gltfUrl: string, shaders: ShaderCollection) => {
  const {lampShader} = shaders;

  const loader = new GltfLoader();
  const asset = await loader.load(gltfUrl);
  console.log('asset', asset);
  console.log('gltf', asset.gltf);

  return {
    lampObject: await readLampObject(gl, lampShader, asset),
    // lampArmature: ...
  };
};
