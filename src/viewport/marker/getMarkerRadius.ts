import {Marker, MarkerType} from './index';

export const getMarkerRadius = (marker: Marker) => {
  switch (marker.type) {
    case MarkerType.GizmoMove:
    case MarkerType.GizmoRotate:
      return marker.radius || 20;

    default:
      return 15;
  }
};
