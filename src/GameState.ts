import { Camera } from './Camera';
import Controls from './Controls';
import { AngleDeg, clamp, Seconds, Vec3 } from './math';
import { Scene } from './scene';

/**
 * Represents the current state of the game.
 *
 * This updates each frame, using the input of the user to guide updates as well.
 */
export class GameState {
  private position: Vec3 = new Vec3(0, 0, 0);
  private pitch: AngleDeg = 0.0;
  private yaw: AngleDeg = 0.0;

  private camera(): Camera {
    return new Camera(this.position, this.pitch, this.yaw);
  }

  /**
   * Update the state of the game.
   *
   * @param delta the amount of time that has passed, in seconds
   * @param controls the current input state by the user
   */
  update(delta: Seconds, controls: Controls) {
    const [relX, relY, relZ] = this.camera().relativeXYZ();
    const xFactor = controls.left ? -1 : controls.right ? 1 : 0.0;
    const yFactor = controls.down ? -1 : controls.up ? 1 : 0.0;
    const zFactor = controls.forward ? -1 : controls.back ? 1 : 0.0;
    const positionDelta = relX
      .scale(xFactor)
      .add(relY.scale(yFactor))
      .add(relZ.scale(zFactor));
    this.position = this.position.add(positionDelta.norm().scale(delta * 5));
    this.yaw -= controls.mouseDx / 45;
    this.pitch = clamp(this.pitch - controls.mouseDy / 45, -90, 90);
  }

  /**
   * Calculate a description of the current scene
   */
  scene(): Scene {
    return { camera: this.camera() };
  }
}
