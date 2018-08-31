import {GltfAsset} from 'gltf-loader-ts';
import {Shader, Vao, VaoAttrInit, BYTES} from '../gl-utils';
import {ObjectGeometry} from './structs';

type TypedArrayConvertMapFn = (n: number) => number;

/*
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 *
 * Note about bone indices as attributes:
 *   Bone indices are ints (actually unsigned shorts = gl.UNSIGNED_SHORT = 5123).
 *   Webgl shaders do no accept ints/shorts. We have to convert all to floats.
 */

/**
 * Reinterpret raw data from binary part of gltf. Returned array does not have to have same length!
 * e.g (256 of u8) make (128 of u16) or (64 of u32) etc.
 */
const reinterpretRawBytes = (srcBuffer: Uint8Array, TargetType: Function, targetTypeBytes: number) => {
  const {buffer, byteOffset, length} = srcBuffer;
  const newLength = length / targetTypeBytes; // e.g. (256 of u8) make (128 of u16) etc.
  return new (TargetType as any)(buffer, byteOffset, newLength) as any;
};

const getAttributeData = async (gl: Webgl, asset: GltfAsset, accessorId: number) => {
  const accessor = asset.gltf.accessors[accessorId];
  const rawData = await asset.accessorData(accessorId);

  // componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number
  switch (accessor.componentType) {
    case gl.FLOAT: // 5126
      // console.log(`PRINT_REINTERPRET: ${accessor.name}`, reinterpretRawBytes(rawData, Float32Array, BYTES.FLOAT));
      return rawData; // will be accepted no problem

    case gl.UNSIGNED_SHORT: { // 5123
      const dataAsU16 = reinterpretRawBytes(rawData, Uint16Array, BYTES.SHORT);
      // add half to correct (maybe?) rounding errors e.g. (1:u32) -> (0.99:f32) -> (0:u32)
      return Float32Array.from(dataAsU16, (e: number) => e + 0.5);
    }

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
  const accessor = asset.gltf.accessors[indicesAccesorId];
  if (accessor.componentType !== gl.UNSIGNED_BYTE) {
    // TODO hardcoded for now to gl.UNSIGNED_BYTE
    throw `Unsupported index buffer component type (${accessor.componentType})`;
  }

  const dataRaw = await asset.bufferViewData(accessor.bufferView);
  // console.log(`INDEX_BUFFER`, dataRaw);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dataRaw, gl.STATIC_DRAW);

  return {
    type: gl.UNSIGNED_BYTE,
    buffer,
    triangleCnt: accessor.count / 3,
  };
};

type GltfAttrToShaderAttrMap = {[gltfAttrKey: string]: string};

export const readObject = async (gl: Webgl, asset: GltfAsset, shader: Shader, meshName: string, attrMap: GltfAttrToShaderAttrMap) => {
  const meshDesc = asset.gltf.meshes.filter(e => e.name === meshName)[0];
  if (!meshDesc) { throw `Could not find lamp object (looked for ${meshName})`; }

  // each attribute refers to accessor
  const mesh = meshDesc.primitives[0]; // might as well
  const attributes = mesh.attributes;
  const attrInitOpts: VaoAttrInit[] = [];

  for (let gltfAttrName in attrMap) {
    if (!(gltfAttrName in attributes)) {
      throw `Could not find ${meshName}.${gltfAttrName} attribute in glft file`;
    }

    const shaderAttrName = attrMap[gltfAttrName];
    const data = await getAttributeData(gl, asset, attributes[gltfAttrName]);
    attrInitOpts.push(new VaoAttrInit(shaderAttrName, data, 0, 0));
  }

  const vao = new Vao(gl, shader, attrInitOpts);
  const indexBuffer = await createIndexBuffer(gl, asset, mesh.indices);
  return new ObjectGeometry(vao, indexBuffer.type, indexBuffer.buffer, indexBuffer.triangleCnt);
};
