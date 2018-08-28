import {
  transpose,
  create as mat4_Create,
  identity,
  translate,
  rotateX,
  rotateY,
  perspective
} from 'gl-mat4';
import { fromValues as vec3_Create, vec3 } from 'gl-vec3';
import { transformPointByMat4, toRadians } from '../gl-utils';

class MouseState {
  isClicked = false;
  lastPosition = [0, 0];
}

const MOUSE_LEFT_BTN_WHICH = 1;
const KEY_FORWARD = 'W'.charCodeAt(0);
const KEY_BACK = 'S'.charCodeAt(0);
const KEY_LEFT = 'A'.charCodeAt(0);
const KEY_RIGHT = 'D'.charCodeAt(0);
const KEY_DOWN = 'Z'.charCodeAt(0);
const KEY_UP = 32; // Space, moves up

export class CameraFPS {
  private angles = [0, 0]; // angles like in polar coords
  private position = [0, 0, 10]; // xyz
  private pressedKeys = new Array(128); // keycode => bool
  private mouseState = new MouseState();
  private rotateSpeed = 0;

  constructor (canvas: HTMLCanvasElement) {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
    canvas.addEventListener('mousedown', this.onMouseDown, false);
    canvas.addEventListener('mousemove', this.onMouseMove, false);
    canvas.addEventListener('mouseup', this.onMouseUp, false);
  }

  update (deltaTime: number, moveSpeed: number, rotateSpeed: number) {
    this.rotateSpeed = rotateSpeed;
    const speed = moveSpeed * deltaTime;
    const moveDir = this.calculateMovementDirectionFromKeys(speed); // move direction, global

    if (moveDir[0] !== 0 || moveDir[1] !== 0 || moveDir[2] !== 0) {
      let rotationMat = this.getRotationMat();
      rotationMat = transpose(rotationMat, rotationMat);
      let moveDirLocal = vec3_Create(0, 0, 0);
      moveDirLocal = transformPointByMat4(moveDirLocal, moveDir, rotationMat);

    for (let i = 0; i < this.position.length; i++) {
        this.position[i] += moveDirLocal[i];
      }
    }
  }

  private calculateMovementDirectionFromKeys (speed: number) {
    let moveDir = vec3_Create(0, 0, 0);
    if (this.pressedKeys[KEY_FORWARD]) { moveDir[2] -= speed; } // z-axis
    if (this.pressedKeys[KEY_BACK])    { moveDir[2] += speed; }
    if (this.pressedKeys[KEY_LEFT])    { moveDir[0] -= speed; } // x-axis
    if (this.pressedKeys[KEY_RIGHT])   { moveDir[0] += speed; }
    if (this.pressedKeys[KEY_UP])      { moveDir[1] += speed; } // y-axis
    if (this.pressedKeys[KEY_DOWN])    { moveDir[1] -= speed; }
    return moveDir;
  }

  getViewMatrix () {
    const rotMat = this.getRotationMat();
    const pos = this.getPosition();

    let result = mat4_Create();
    identity(result);
    translate(result, rotMat, [-pos[0], -pos[1], -pos[2]]);

    return result;
  }

  private getRotationMat () {
    const angles = this.angles;

    let result = mat4_Create();
    rotateX(result, result, angles[0]); // up-down
    rotateY(result, result, angles[1]); // left-right

    return result;
  }

  getProjectionMatrix (fovDgr: number, viewportWidth: number, viewportHeight: number) {
    const fovRad = toRadians(fovDgr);
    const aspectRatio = viewportWidth / viewportHeight;
    const zNear = 0.01;
    const zFar = 1000;

    return perspective([] as any, fovRad, aspectRatio, zNear, zFar);
  }

  getPosition () {
    const pos = this.position;
    return vec3_Create(pos[0], pos[1], pos[2]);
  }

  // <editor-fold listeners>

  private onKeyDown (event: KeyboardEvent) {
    this.pressedKeys[event.keyCode] = true;
  }

  private onKeyUp (event: KeyboardEvent) {
    this.pressedKeys[event.keyCode] = false;
  }

  private onMouseDown (event: MouseEvent ) {
    if (event.which === MOUSE_LEFT_BTN_WHICH) {
      this.mouseState.isClicked = true;
    }
    this.mouseState.lastPosition[0] = event.pageX;
    this.mouseState.lastPosition[1] = event.pageY;
  }

  private onMouseMove (event: MouseEvent) {
    let mouseState = this.mouseState;
    if (!mouseState.isClicked) { return; }

    let mouseDelta = [
      event.pageX - mouseState.lastPosition[0],
      event.pageY - mouseState.lastPosition[1],
    ];
    mouseState.lastPosition[0] = event.pageX;
    mouseState.lastPosition[1] = event.pageY;

    this.angles[1] += mouseDelta[0] * this.rotateSpeed;
    while (this.angles[1] < 0)
        this.angles[1] += toRadians(360);
    while (this.angles[1] >= toRadians(360))
        this.angles[1] -= toRadians(360);

    this.angles[0] += mouseDelta[1] * this.rotateSpeed;
    while (this.angles[0] < -toRadians(90))
        this.angles[0] = -toRadians(90);
    while (this.angles[0] > toRadians(90))
        this.angles[0] = toRadians(90);
  }

  private onMouseUp (event: MouseEvent ) {
    this.mouseState.isClicked = false;
  }

  // </editor-fold>

}
