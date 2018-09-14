import {h, Component} from 'preact';
import {Icon} from './Icon';
import {pick} from 'lodash';

// not exported, defined here as minimal usable interface
interface FaIconType {
  width: number;
  height: number;
  svgPathData: string;
}

interface FaIconProps {
  color?: string;
  size?: string;
  style?: object;
  svg: FaIconType;
}

const getViewBox = (svg: FaIconType) => {
  const {width, height} = svg;
  return `0 0 ${width} ${height}`;
};

export const FaIcon = (props: FaIconProps) => {
  const {svg} = props;
  const iconProps = pick(props, ['color', 'size', 'style']);

  return (
    <Icon viewBox={getViewBox(svg)} {...iconProps}>
      <g><path d={svg.svgPathData}/></g>
    </Icon>
  );
};
