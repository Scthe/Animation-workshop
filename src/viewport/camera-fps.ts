import {
  transpose,
  create as mat4_Create,
  identity,
  translate,
  rotateX,
  rotateY,
  perspective
} from 'gl-mat4';
import {fromValues as vec3_Create} from 'gl-vec3';
import {transformPointByMat4, toRadians} from 'gl-utils';
import {MouseDragEvent} from './MouseHandler';

const KEY_FORWARD = 'W'.charCodeAt(0);
const KEY_BACK    = 'S'.charCodeAt(0);
const KEY_LEFT    = 'A'.charCodeAt(0);
const KEY_RIGHT   = 'D'.charCodeAt(0);
const KEY_DOWN    = 'Z'.charCodeAt(0);
const KEY_UP      = 32; // Space, moves up

interface CameraSettings {
  fovDgr: number;
  zNear: number;
  zFar: number;
}

export class CameraFPS {
  private angles = [0, 0]; // angles like in polar coords
  private position = [0, 0, 2]; // xyz
  private rotateSpeed = 0;

  constructor (public settings: CameraSettings) {
  }

  update (deltaTime: number, moveSpeed: number, rotateSpeed: number, keyState: boolean[]) {
    this.rotateSpeed = rotateSpeed; // save for future async mouse move

    const speed = moveSpeed * deltaTime;
    const moveDir = this.calculateMovementDirectionFromKeys(keyState, speed);

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

  private calculateMovementDirectionFromKeys (keyState: boolean[], speed: number) {
    let moveDir = vec3_Create(0, 0, 0);
    if (keyState[KEY_FORWARD]) { moveDir[2] -= speed; } // z-axis
    if (keyState[KEY_BACK])    { moveDir[2] += speed; }
    if (keyState[KEY_LEFT])    { moveDir[0] -= speed; } // x-axis
    if (keyState[KEY_RIGHT])   { moveDir[0] += speed; }
    if (keyState[KEY_UP])      { moveDir[1] += speed; } // y-axis
    if (keyState[KEY_DOWN])    { moveDir[1] -= speed; }
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

  getProjectionMatrix (viewportWidth: number, viewportHeight: number) {
    const {fovDgr, zNear, zFar} = this.settings;
    const aspectRatio = viewportWidth / viewportHeight;
    return perspective([] as any, toRadians(fovDgr), aspectRatio, zNear, zFar);
  }

  getPosition () {
    const pos = this.position;
    return vec3_Create(pos[0], pos[1], pos[2]);
  }

  onMouseMove (event: MouseDragEvent) {
    const {delta} = event;

    this.angles[1] += delta[0] * this.rotateSpeed;
    while (this.angles[1] < 0)
        this.angles[1] += toRadians(360);
    while (this.angles[1] >= toRadians(360))
        this.angles[1] -= toRadians(360);

    this.angles[0] += delta[1] * this.rotateSpeed;
    while (this.angles[0] < -toRadians(90))
        this.angles[0] = -toRadians(90);
    while (this.angles[0] > toRadians(90))
        this.angles[0] = toRadians(90);
  }

}
