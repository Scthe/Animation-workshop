import { GltfLoader, GltfAsset } from 'gltf-loader-ts';
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

const convertBuffer_U16_To_F32 = (buffer: Uint8Array) => {
  // bone indices are ints (actually unsigned shorts = 5123). Webgl shaders
  // do no accept ints/shorts. We have to convert all to floats.
  // e.g. for 72 vertices there are (72[vertices] * 4[boneInfluence/vertex] = 284[boneInfluence])

  // First reinterpret raw bytes as Uint16
  // console.log(`buffer:raw (byteLength=${buffer.byteLength}, byteOffset=${buffer.byteOffset}, length=${buffer.length}) `, buffer.buffer);
  const dataBoneIdsAsUint16 = new Uint16Array(buffer.buffer, buffer.byteOffset, buffer.length / BYTES.SHORT);
  // console.log('buffer:i : ', dataBoneIdsAsUint16);

  // map each of Uint16 to float
  // add half to correct (maybe?) rounding errors e.g. (1:u32) -> (0.99:f32) -> (0:u32)
  const dataBoneIdsAsF32 = Float32Array.from(dataBoneIdsAsUint16, (n: number) => n + 0.5);
  // console.log('buffer:f : ', dataBoneIdsAsF32);

  return dataBoneIdsAsF32;
};

const getAttributeData = async (gl: Webgl, asset: GltfAsset, accessorId: number) => {
  const accessor = asset.gltf.accessors[accessorId];
  const rawData = await asset.accessorData(accessorId);

  // componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number
  switch (accessor.componentType) {
    case gl.FLOAT: // 5126
      return rawData; // will be accepted no problem
    case gl.UNSIGNED_SHORT: // 5123
      return convertBuffer_U16_To_F32(rawData);
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


  // `data` can be bound via `gl.BindBuffer`,
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
  const indicesAccesor = gltf.accessors[mesh.indices];
  const dataIndices = await asset.bufferViewData(indicesAccesor.bufferView);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // TODO this convert is weird. it will map (U8 -> U16),
  // but we prob. want to reinterpret ([U8, U8] -> U16)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dataIndices), gl.STATIC_DRAW);

  // const idxCnt = indicesAccesor.count;
  // console.log(`indices(${idxCnt}), triangles (${idxCnt/3}), quads(${idxCnt/6}), cubes(${idxCnt/6/6}) not known #vertices, cause indexing + raw data`);
  return new ObjectGeometry(vao, gl.UNSIGNED_SHORT, indexBuffer, indicesAccesor.count / 3);
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
