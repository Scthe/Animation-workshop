import {GltfAsset} from 'gltf-loader-ts';
import {Shader, Vao, VaoAttrInit, BYTES} from 'gl-utils';
import {reinterpretRawBytes} from './_utils';
import {Mesh} from '../index';

/*
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 *
 * Note about bone indices as attributes:
 *   Bone indices are ints (actually unsigned shorts = gl.UNSIGNED_SHORT = 5123).
 *   Webgl shaders do no accept ints/shorts. We have to convert all to floats.
 */

const getAttributeData = async (gl: Webgl, asset: GltfAsset, accessorId: number) => {
  const accessor = asset.gltf.accessors[accessorId];
  const rawData = await asset.accessorData(accessorId);

  // componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number
  switch (accessor.componentType) {
    case gl.FLOAT: // 5126
      return rawData; // will be accepted no problem - just raw data

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
    // hardcoded for now to gl.UNSIGNED_BYTE
    throw `Unsupported index buffer component type (${accessor.componentType})`;
  }

  const dataRaw = await asset.bufferViewData(accessor.bufferView);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dataRaw, gl.STATIC_DRAW);

  return {
    indexGlType: gl.UNSIGNED_BYTE,
    indexBuffer: buffer,
    triangleCnt: accessor.count / 3,
  };
};

type GltfAttrToShaderAttrMap = {[gltfAttrKey: string]: string};

export const loadMesh = async (
  gl: Webgl, shader: Shader, asset: GltfAsset, meshIdx: number,
  attrMap: GltfAttrToShaderAttrMap
) => {
  const meshDesc = asset.gltf.meshes[meshIdx];

  // each attribute refers to accessor
  const mesh = meshDesc.primitives[0]; // might as well
  const attributes = mesh.attributes;
  const attrInitOpts: VaoAttrInit[] = [];

  for (let gltfAttrName in attrMap) {
    if (!(gltfAttrName in attributes)) {
      throw `Could not find ${meshDesc.name}.${gltfAttrName} attribute in glft file`;
    }

    const shaderAttrName = attrMap[gltfAttrName];
    const data = await getAttributeData(gl, asset, attributes[gltfAttrName]);
    attrInitOpts.push(new VaoAttrInit(shaderAttrName, data, 0, 0));
  }

  const vao = new Vao(gl, shader, attrInitOpts);
  const indexBuffer = await createIndexBuffer(gl, asset, mesh.indices);
  return { vao, ...indexBuffer } as Mesh;
};
