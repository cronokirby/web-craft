import Renderer from './Renderer';
import { AngleDeg, clamp, Color, Seconds, Vec3 } from './math';
import { Camera } from './Camera';
import Controls from './Controls';
import Resources from './Resources';

class Loop {
  private last: number | null = null;
  private position: Vec3 = new Vec3(0.0, 0.0, 2.0);
  private pitch: AngleDeg = 0.0;
  private yaw: AngleDeg = 0.0;

  constructor(private renderer: Renderer, private controls: Controls) {}

  private delta(timestamp: number): Seconds {
    if (this.last === null) {
      this.last = timestamp;
    }
    const delta = timestamp - this.last;
    this.last = timestamp;

    return delta / 1000;
  }

  step(timestamp: number) {
    const delta = this.delta(timestamp);

    const oldCamera = new Camera(this.position, this.pitch, this.yaw);

    const [relX, relY, relZ] = oldCamera.relativeXYZ();
    const xFactor = this.controls.left ? -1 : this.controls.right ? 1 : 0.0;
    const yFactor = this.controls.down ? -1 : this.controls.up ? 1 : 0.0;
    const zFactor = this.controls.forward ? -1 : this.controls.back ? 1 : 0.0;
    const positionDelta = relX
      .scale(xFactor)
      .add(relY.scale(yFactor))
      .add(relZ.scale(zFactor));
    this.position = this.position.add(positionDelta.norm().scale(delta * 5));
    this.yaw -= this.controls.mouseDx / 45;
    this.pitch = clamp(this.pitch - this.controls.mouseDy / 45, -90, 90);
    this.controls.onHandle();

    const newCamera = new Camera(this.position, this.pitch, this.yaw);
    this.renderer.draw({ camera: newCamera });
    window.requestAnimationFrame((timestamp) => this.step(timestamp));
  }
}

const canvas = document.getElementById('root-canvas') as HTMLCanvasElement;

canvas.addEventListener('click', () => {
  canvas.requestPointerLock();
});

const controls = new Controls();
window.addEventListener('keydown', (event) => controls.onKeyDown(event));
window.addEventListener('keyup', (event) => controls.onKeyUp(event));

const onMouseMove = controls.onMouseMove.bind(controls);
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    document.addEventListener('mousemove', onMouseMove, false);
  } else {
    document.removeEventListener('mousemove', onMouseMove, false);
  }
});

async function main() {
  const resources = await Resources.load();
  const gl = canvas.getContext('webgl');
  const renderer = Renderer.init(gl, resources);
  const loop = new Loop(renderer, controls);
  window.requestAnimationFrame((timestamp) => loop.step(timestamp));
}

main();
