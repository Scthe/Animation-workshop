import {vec2} from 'gl-vec2';
import {NDCtoPixels, getDist2} from 'gl-utils';
import {Marker} from './index';


const getMarkerPositionPx = (viewport: number[], marker: Marker) => {
  const {positionNDC} = marker.$_framePosition;
  return NDCtoPixels(positionNDC, viewport[0], viewport[1], true);
};

export const getMarkerAt = (viewport: number[], markers: Marker[], pixel: vec2) => {
  const wasClicked = (marker: Marker) => {
    const markerPosPx = getMarkerPositionPx(viewport, marker);
    const dist2 = getDist2(markerPosPx, pixel);
    const r = marker.radius;
    return dist2 < (r * r);
  };

  return markers.find(wasClicked);
};
