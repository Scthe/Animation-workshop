export * from './WithDimensions';
export * from './classnames';
export * from './createRef';
export {clamp} from 'gl-utils';

export const cancelEvent = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
};
