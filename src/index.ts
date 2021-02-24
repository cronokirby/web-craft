import Renderer from './Renderer';
import { AngleDeg, clamp, Color, Seconds, Vec3 } from './math';
import { Camera } from './Camera';
import Controls from './Controls';

class Loop {
  private last: number | null = null;
  private seconds: number = 0.0;
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
    this.seconds += delta;

    const ar = this.renderer.calculateAR();
    const oldCamera = new Camera(this.position, this.pitch, this.yaw, ar)

    const xFactor = this.controls.left ? -delta : this.controls.right ? delta : 0.0;
    this.position = this.position.add(oldCamera.relativeX().scale(xFactor));
    const yFactor = this.controls.down ? -delta : this.controls.up ? delta : 0.0;
    this.position = this.position.add(new Vec3(0, 1, 0).scale(yFactor));
    const zFactor = this.controls.forward ? -delta : this.controls.back ? delta : 0.0;
    this.position = this.position.add(oldCamera.relativeZ().scale(zFactor));
    this.yaw -= this.controls.mouseDx / 45;
    this.pitch = clamp(this.pitch - this.controls.mouseDy / 45, -90, 90);
    this.controls.onHandle();

    const newCamera = new Camera(this.position, this.pitch, this.yaw, ar)
    this.renderer.draw(
      newCamera,
      new Color(0.8, Math.cos(this.seconds), Math.sin(this.seconds)),
      this.seconds * 45,
    );
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

const gl = canvas.getContext('webgl');
const renderer = Renderer.init(gl);
const loop = new Loop(renderer, controls);
window.requestAnimationFrame((timestamp) => loop.step(timestamp));
