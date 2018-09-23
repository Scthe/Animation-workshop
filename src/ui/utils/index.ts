export * from './WithDimensions';
export * from './classnames';
export * from './createRef';

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const cancelEvent = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
};