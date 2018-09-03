import {NDCtoPixels} from '../../gl-utils';
import {GlState} from '../GlState';
import {Marker, getMarkerRadius} from './index';


export const getMarkerAt = (glState: GlState, pixelX: number, pixelY: number, markers: Marker[]) => {
  // console.log(`Clicked (${pixelX}, ${pixelY})`);
  const {width, height} = glState.getViewport();

  const wasClicked = (marker: Marker, i: number) => {
    const {positionNDC} = marker.position;
    const radius = getMarkerRadius(marker);
    const [posX, posY] = NDCtoPixels(positionNDC, width, height, true);
    const delta = [pixelX - posX, pixelY - posY];
    const dist2 = delta[0] * delta[0] + delta[1] * delta[1];
    // console.log(`Marker[${i}] (x=${posX}, y=${posY}) dist: ${Math.sqrt(dist2)}`);
    return dist2 < (radius * radius);
  };

  return markers.filter(wasClicked)[0];
};
