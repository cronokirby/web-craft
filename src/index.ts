import Renderer from './Renderer';
import { Color, Seconds, Vec3 } from './math';
import { Camera } from './Camera';

class ControlState {
  public left: boolean = false;
  public right: boolean = false;
  public forward: boolean = false;
  public back: boolean = false;
  public up: boolean = false;
  public down: boolean = false;
}

class Loop {
  private last: number | null = null;
  private seconds: number = 0.0;
  private position: Vec3 = new Vec3(0.0, 0.0, -1.0);

  constructor(private renderer: Renderer, private controls: ControlState) {}

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

    if (this.controls.left) {
      this.position.x -= delta;
    }
    if (this.controls.right) {
      this.position.x += delta;
    }
    if (this.controls.forward) {
      this.position.z += delta;
    }
    if (this.controls.back) {
      this.position.z -= delta;
    }
    if (this.controls.up) {
      this.position.y += delta;
    }
    if (this.controls.down) {
      this.position.y -= delta;
    }

    const ar = this.renderer.calculateAR();
    this.renderer.draw(
      new Camera(this.position, 0.0, 0.0, ar),
      new Color(0.8, Math.cos(this.seconds), Math.sin(this.seconds)),
      this.seconds * 45,
    );
    window.requestAnimationFrame((timestamp) => this.step(timestamp));
  }
}

const canvas = document.getElementById('root-canvas') as HTMLCanvasElement;

const controls = new ControlState();
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'd': {
      controls.right = true;
      break;
    }
    case 'a': {
      controls.left = true;
      break;
    }
    case 'w': {
      controls.forward = true;
      break;
    }
    case 's': {
      controls.back = true;
      break;
    }
    case 'Shift': {
      controls.down = true;
      break;
    }
    case ' ': {
      controls.up = true;
      break;
    }
  }
});
window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd': {
      controls.right = false;
      break;
    }
    case 'a': {
      controls.left = false;
      break;
    }
    case 'w': {
      controls.forward = false;
      break;
    }
    case 's': {
      controls.back = false;
      break;
    }
    case 'Shift': {
      controls.down = false;
      break;
    }
    case ' ': {
      controls.up = false;
      break;
    }
  }
});

const gl = canvas.getContext('webgl');
const renderer = Renderer.init(gl);
const loop = new Loop(renderer, controls);
window.requestAnimationFrame((timestamp) => loop.step(timestamp));
