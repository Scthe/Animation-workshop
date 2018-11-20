import {
  createWebGlContext, Axis,
  DrawParameters, applyDrawParams
} from 'gl-utils';
import {GizmoType} from './gizmo';
import {Transform, createInitTransform} from 'gl-utils';

// TODO add here draggedDisplacement: Keyframe for tmp. move/rotate while dragging?
interface DraggingStatus {
  // when we are moving/rotating/scaling
  draggedAxis?: Axis;
  // we can drag and switch gizmo using key-shortcut. this is local copy for such cases
  draggedGizmo?: GizmoType;
  // when dragging, this transform represents current displacement.
  // Only one of position/roration/scale from this object is used at the time (rest is zeroed)
  temporaryDisplacement: Transform;
}

export class GlState {

  public gl: Webgl;
  public canvas: HTMLCanvasElement;
  private drawParams: DrawParameters;
  public draggingStatus: DraggingStatus;
  // IO
  public pressedKeys: boolean[] = new Array(128); // keycode => bool


  async init (canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = createWebGlContext(this.canvas, {});

    this.drawParams = new DrawParameters();
    applyDrawParams(this.gl, this.drawParams, undefined, true);

    this.draggingStatus = GlState.createSelection();

    // IO
    window.addEventListener('keydown', event => {
      this.pressedKeys[event.keyCode] = true;
    }, false);
    window.addEventListener('keyup', event => {
      this.pressedKeys[event.keyCode] = false;
    }, false);
  }

  private static createSelection () {
    return {
      draggedAxis: undefined as Axis,
      draggedGizmo: GizmoType.Move,
      temporaryDisplacement: createInitTransform(),
    };
  }

  setDrawState (nextParams: DrawParameters) {
    applyDrawParams(this.gl, nextParams, this.drawParams);
    this.drawParams = nextParams;
  }

  getViewport () {
    return [this.canvas.width, this.canvas.height];
  }

  isDragging () {
    return this.draggingStatus.draggedAxis !== undefined;
  }

}
