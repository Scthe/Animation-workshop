import {vec2} from 'gl-vec2';
import {Marker} from './index';
import {Scene} from 'viewport/scene';
import {generateRayFromCamera, sphereIntersect} from 'gl-utils/raycast';
import {uiBridge, appStateGetter} from 'state';


export const getMarkerAt = (viewport: number[], scene: Scene, pixel: vec2): Marker => {
  const markers = scene.getMarkers();

  const {markerSize} = uiBridge.getFromUI(
    appStateGetter('markerSize')
  );

  const cameraRay = generateRayFromCamera({
    viewport: {width: viewport[0], height: viewport[1]},
    viewProjMat: scene.getVP(),
  }, pixel);

  const wasClicked = (marker: Marker) => {
    if (!marker.clickable) {
      return false;
    }

    return sphereIntersect(cameraRay, {
      origin: marker.$position3d,
      radius: marker.getRadius(markerSize),
    });
  };

  const clickedMarkers = markers.filter(wasClicked);
  return clickedMarkers[0];
};
