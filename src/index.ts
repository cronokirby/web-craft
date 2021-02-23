import Renderer from './Renderer';

const canvas = document.getElementById('root-canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const gl = canvas.getContext('webgl');
const renderer = Renderer.init(gl);
renderer.draw([0.8, 0.3, 0.4, 1.0]);
