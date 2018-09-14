import {h, Component} from 'preact';
import {omit} from 'lodash';

// based on https://github.com/efflam/preact-icon-base (MIT licence)
// rewritten to simplify, make compatible with TS

interface IconProps {
  children: any;
  color?: string;
  size?: any; // string or number, but TS is shouting
  style?: object;
  [key: string]: any;
}

const getStyle = (props: IconProps) => {
  const {color, style} = props;
  return {
    verticalAlign: 'middle',
    color,
    ...style
  };
};

export const Icon = (props: IconProps) => {
  const {children, size} = props;
  const propsRest = omit(props, 'children', 'color', 'size', 'style');
  const computedSize = size || '1em';

  return (
    <svg
      children={children}
      fill='currentColor'
      preserveAspectRatio='xMidYMid meet'
      height={computedSize}
      width={computedSize}
      style={getStyle(props)}
      {...propsRest}
    />
  );
};
