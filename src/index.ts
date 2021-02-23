import Renderer from './Renderer';
import { Color, Seconds } from './math';

class Loop {
  private last: number | null = null;
  private seconds: number = 0.0;

  constructor(private renderer: Renderer) {}

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

    this.renderer.draw(
      new Color(0.8, Math.cos(this.seconds), Math.sin(this.seconds)),
    );

    window.requestAnimationFrame((timestamp) => this.step(timestamp));
  }
}

const canvas = document.getElementById('root-canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl');
const renderer = Renderer.init(gl);
const loop = new Loop(renderer);
window.requestAnimationFrame((timestamp) => loop.step(timestamp));
