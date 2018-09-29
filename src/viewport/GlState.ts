import {
  createWebGlContext, Axis,
  DrawParameters, applyDrawParams
} from 'gl-utils';
import {GizmoType} from './gizmo';

interface SelectionStatus {
  // TODO add here draggedDisplacement: Keyframe for tmp. move/rotate while dragging?
  currentObject?: string;
  // when we are moving/rotating/scaling
  draggedAxis?: Axis;
  // we can drag and switch gizmo using key-shortcut. this is local copy for such cases
  draggedGizmo?: GizmoType;
}

export class GlState {

  public gl: Webgl;
  private canvas: HTMLCanvasElement;
  private drawParams: DrawParameters;
  public selection: SelectionStatus;
  // IO
  public pressedKeys: boolean[] = new Array(128); // keycode => bool


  async init (canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = createWebGlContext(this.canvas, {});

    this.drawParams = new DrawParameters();
    applyDrawParams(this.gl, this.drawParams, undefined, true);

    this.selection = GlState.createSelection();

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
      draggedGizmo: GizmoType.Rotate,
      currentObject: undefined as string,
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
    return this.selection.draggedAxis !== undefined;
  }

}
