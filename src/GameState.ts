import { Camera } from './Camera';
import Controls from './Controls';
import { AngleDeg, clamp, Seconds, Vec3 } from './math';
import { ChunkView, Scene } from './scene';

function geometry(): Float32Array {
  const buf = new Float32Array(6 * 6 * 6);
  let i = 0;
  const addVertex = (v: Vec3) => {
    buf[i++] = v.x;
    buf[i++] = v.y;
    buf[i++] = v.z;
  };
  const addColor = (c: number[]) => {
    buf[i++] = c[0];
    buf[i++] = c[1];
  };
  const addShading = (s: number) => {
    buf[i++] = s;
  };
  const face = (
    tex: number,
    shading: number,
    base: Vec3,
    eY: Vec3,
    eX: Vec3,
  ) => {
    const a = base;
    const b = base.add(eY);
    const c = base.add(eX);
    const d = b.add(eX);
    const texX = (tex % 16) / 16;
    const texY = Math.floor(tex / 16) / 16;

    addVertex(a);
    addColor([texX, texY + 1.0 / 16]);
    addShading(shading);

    addVertex(c);
    addColor([texX + 1.0 / 16, texY + 1.0 / 16]);
    addShading(shading);

    addVertex(b);
    addColor([texX, texY]);
    addShading(shading);

    addVertex(d);
    addColor([texX + 1.0 / 16, texY]);
    addShading(shading);

    addVertex(b);
    addColor([texX, texY]);
    addShading(shading);

    addVertex(c);
    addColor([texX + 1.0 / 16, texY + 1.0 / 16]);
    addShading(shading);
  };
  // Front faces
  // Front
  face(3, 0.9, new Vec3(0, 0, 1), new Vec3(0, 1, 0), new Vec3(1, 0, 0));
  // Left
  face(3, 0.8, new Vec3(0, 0, 0), new Vec3(0, 1, 0), new Vec3(0, 0, 1));
  // Top
  face(0, 1.0, new Vec3(0, 1, 1), new Vec3(0, 0, -1), new Vec3(1, 0, 0));
  // Back
  face(3, 0.9, new Vec3(1, 0, 0), new Vec3(0, 1, 0), new Vec3(-1, 0, 0));
  // Bottom
  face(2, 1.0, new Vec3(0, 0, 0), new Vec3(0, 0, 1), new Vec3(1, 0, 0));
  // Right
  face(3, 0.8, new Vec3(1, 0, 1), new Vec3(0, 1, 0), new Vec3(0, 0, -1));

  return buf;
}

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
    this.chunk = {
      position: new Vec3(0, 0, -8),
      vertex_info: geometry(),
      vertex_count: 6 * 6,
    };
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
    this.position = this.position.add(positionDelta.norm().scale(delta * 5));
    this.yaw -= controls.mouseDx / 45;
    this.pitch = clamp(this.pitch - controls.mouseDy / 45, -90, 90);
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
