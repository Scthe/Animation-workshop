import {vec2} from 'gl-vec2';
import {vec3, squaredDistance} from 'gl-vec3';
import {Marker, MarkerTypeList} from './index';
import {Scene} from 'viewport/scene';
import {generateRayFromCamera, sphereIntersect} from 'gl-utils/raycast';
import {uiBridge, appStateGetter} from 'state';

const isHigherPrecedence = (cameraPos: vec3) => (old: Marker, newM: Marker) => {
  if (old.type === newM.type) {
    return squaredDistance(newM.$position3d, cameraPos) < squaredDistance(old.$position3d, cameraPos);
  }
  return MarkerTypeList.indexOf(newM.type) < MarkerTypeList.indexOf(old.type);
};

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
  const isHigherPrecedence_ = isHigherPrecedence(scene.camera.getPosition());

  return clickedMarkers.reduce((acc: Marker, m: Marker) => {
    return isHigherPrecedence_(acc, m) ? m : acc;
  }, clickedMarkers[0]);
};
