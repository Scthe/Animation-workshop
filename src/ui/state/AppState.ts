import {observable, computed} from 'mobx';
import {GizmoType} from 'viewport/gizmo';

export class AppState {

  // when viewport fills whole view
  @observable isFullscreen = false;
  // current manipulator
  @observable currentGizmo = GizmoType.Move;
  @observable gizmoSize = 10;
  //
  @observable isUseLocalSpace = true;
  @observable markerSize = 10;
  @observable useSlerp = true;
  @observable showTimeAsSeconds = true;
  @observable showDebug = true;

  isGizmoAllowed (gizmoType: GizmoType) {
    return gizmoType !== GizmoType.Scale;
  }

  @computed
  get currentObject () {
    return {
      hasKeyframeAtCurrentFrame: false,
      keyframe: {
        frameId: 0,
        position: [0, 1, 2],
        rotation: [0, 1, 2, 3],
        scale: [0, 1, 2],
      },
      // TODO remove:
      name: 'BoneLowerArm',
      isBone: true, // one of {Bone, Object3d}
      /*constraints: {
        position: AllowAll,
        rotation: [Constraint.Disallow, Constraint.Allow, Constraint.Disallow],
        scale:    DisallowAll,
      },*/
    };
  }

}
