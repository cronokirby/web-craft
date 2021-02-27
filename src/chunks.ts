import { BlockType, Side } from './blocks';
import { Vec3 } from './math';
import { ChunkView } from './scene';

const TB_FACE_SHADING = 1.0;
const LR_FACE_SHADING = 0.8;
const FB_FACE_SHADING = 0.9;

class ChunkMaker {
  private buf: Float32Array;
  private i: number;

  constructor(count: number) {
    this.buf = new Float32Array(6 * 6 * 6 * count);
    this.i = 0;
  }

  private vertex(v: Vec3) {
    this.buf[this.i++] = v.x;
    this.buf[this.i++] = v.y;
    this.buf[this.i++] = v.z;
  }

  private texCoords(s: number, t: number) {
    this.buf[this.i++] = s;
    this.buf[this.i++] = t;
  }

  private shading(s: number) {
    this.buf[this.i++] = s;
  }

  private face(
    texture: number,
    shading: number,
    base: Vec3,
    eY: Vec3,
    eX: Vec3,
  ) {
    const a = base;
    const b = base.add(eY);
    const c = base.add(eX);
    const d = b.add(eX);
    const shift = 0.15;
    const texX = (texture % 16) / 16 + shift / 16 / 16;
    const texY = Math.floor(texture / 16) / 16 + shift / 16 / 16;
    const dX = 1.0 / 16 - (2 * shift) / 16 / 16;
    const dY = 1.0 / 16 - (2 * shift) / 16 / 16;

    this.vertex(a);
    this.texCoords(texX, texY + dX);
    this.shading(shading);

    this.vertex(c);
    this.texCoords(texX + dX, texY + dY);
    this.shading(shading);

    this.vertex(b);
    this.texCoords(texX, texY);
    this.shading(shading);

    this.vertex(d);
    this.texCoords(texX + dX, texY);
    this.shading(shading);

    this.vertex(b);
    this.texCoords(texX, texY);
    this.shading(shading);

    this.vertex(c);
    this.texCoords(texX + dX, texY + dY);
    this.shading(shading);
  }

  block(position: Vec3, block: BlockType) {
    // Front
    this.face(
      block.texture(Side.Front),
      FB_FACE_SHADING,
      new Vec3(0, 0, 1).add(position),
      new Vec3(0, 1, 0),
      new Vec3(1, 0, 0),
    );
    // Left
    this.face(
      block.texture(Side.Left),
      LR_FACE_SHADING,
      new Vec3(0, 0, 0).add(position),
      new Vec3(0, 1, 0),
      new Vec3(0, 0, 1),
    );
    // Top
    this.face(
      block.texture(Side.Top),
      TB_FACE_SHADING,
      new Vec3(0, 1, 1).add(position),
      new Vec3(0, 0, -1),
      new Vec3(1, 0, 0),
    );
    // Back
    this.face(
      block.texture(Side.Back),
      FB_FACE_SHADING,
      new Vec3(1, 0, 0).add(position),
      new Vec3(0, 1, 0),
      new Vec3(-1, 0, 0),
    );
    // Bottom
    this.face(
      block.texture(Side.Bottom),
      TB_FACE_SHADING,
      new Vec3(0, 0, 0).add(position),
      new Vec3(0, 0, 1),
      new Vec3(1, 0, 0),
    );
    // Right
    this.face(
      block.texture(Side.Right),
      LR_FACE_SHADING,
      new Vec3(1, 0, 1).add(position),
      new Vec3(0, 1, 0),
      new Vec3(0, 0, -1),
    );
  }

  geometry(): Float32Array {
    return this.buf;
  }
}

export interface Block {
  position: Vec3;
  typ: BlockType;
}

export function viewChunk(position: Vec3, ...blocks: Block[]): ChunkView {
  const maker = new ChunkMaker(blocks.length);
  for (const { position, typ } of blocks) {
    maker.block(position, typ);
  }
  return {
    position,
    vertex_info: maker.geometry(),
    vertex_count: 6 * 6 * blocks.length,
  };
}
