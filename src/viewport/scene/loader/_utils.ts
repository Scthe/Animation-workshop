/**
 * Reinterpret raw data from binary part of gltf. Returned array does not have to have same length!
 * e.g (256 of u8) make (128 of u16) or (64 of u32) etc.
 */
export const reinterpretRawBytes = (srcBuffer: Uint8Array, TargetType: Function, targetTypeBytes: number) => {
  const {buffer, byteOffset, length} = srcBuffer;
  const newLength = length / targetTypeBytes; // e.g. (256 of u8) make (128 of u16) etc.
  return new (TargetType as any)(buffer, byteOffset, newLength) as any;
};
