import {Marker, MarkerType} from './index';

export const getMarkerRadius = (marker: Marker) => {
  switch (marker.type) {
    case MarkerType.GizmoMove: return marker.radius || 20;

    // case MarkerType.Armature: return hexToVec3('#823ab9');
    // case MarkerType.GizmoRotate: return hexToVec3('#3aa2b9');
    default: return 5;
  }
};
