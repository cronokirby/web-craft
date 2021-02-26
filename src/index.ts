import Controls from './Controls';
import { GameState } from './GameState';
import { Seconds } from './math';
import Renderer from './Renderer';
import Resources from './Resources';

class Loop {
  private last: number | null = null;

  constructor(
    private renderer: Renderer,
    private controls: Controls,
    private gameState: GameState,
  ) {}

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

    this.gameState.update(delta, this.controls);

    this.controls.onHandle();

    this.renderer.draw(this.gameState.scene());

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
  const loop = new Loop(renderer, controls, new GameState());
  window.requestAnimationFrame((timestamp) => loop.step(timestamp));
}

main();
