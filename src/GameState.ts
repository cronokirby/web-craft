import { BlockType, Side } from './blocks';
import { Camera } from './Camera';
import { Chunk, viewChunk } from './chunks';
import Controls from './Controls';
import { AngleDeg, choose, clamp, Seconds, Vec3 } from './math';
import { ChunkView, Scene } from './scene';

const MOUSE_SPEED = 1 / 45;
const MOVEMENT_SPEED = 4;

/**
 * Represents the current state of the game.
 *
 * This updates each frame, using the input of the user to guide updates as well.
 */
export class GameState {
  private position: Vec3 = new Vec3(0, 0, 0);
  private pitch: AngleDeg = 0.0;
  private yaw: AngleDeg = 0.0;

  private chunk: ChunkView;

  constructor() {
    const chunk = new Chunk();
    for (let z = 0; z < 16; ++z) {
      for (let y = 0; y < 16; ++y) {
        for (let x = 0; x < 16; ++x) {
          if (Math.random() < 0.5) {
            continue;
          }
          chunk.setBlock([x, y, z], choose(BlockType.All));
        }
      }
    }
    this.chunk = viewChunk(new Vec3(-8, -8, -32), chunk);
  }

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
    this.position = this.position.add(
      positionDelta.norm().scale(delta * MOVEMENT_SPEED),
    );
    this.yaw -= controls.mouseDx * MOUSE_SPEED;
    this.pitch = clamp(this.pitch - controls.mouseDy * MOUSE_SPEED, -90, 90);
  }

  /**
   * Calculate a description of the current scene
   */
  scene(): Scene {
    return {
      camera: this.camera(),
      chunk: this.chunk,
    };
  }
}
