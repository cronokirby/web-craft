const canvas = document.getElementById('root-canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.rect(20, 20, 150, 150);
ctx.fill();
