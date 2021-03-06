import { BlockType, Side } from './blocks';
import { Vec3 } from './math';
import { ChunkView } from './scene';

type ChunkPos = [number, number, number];

const CHUNK_SIZE = 16;

export class Chunk {
  private blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
  private stale = false;
  private vertex_info: Float32Array;

  constructor(public readonly position: Vec3) {}

  setBlock(pos: ChunkPos, typ: BlockType) {
    this.blocks[(pos[2] << 8) | (pos[1] << 4) | pos[0]] = typ.id;
    this.stale = true;
  }

  getBlock(pos: ChunkPos): BlockType | null {
    const id = this.blocks[(pos[2] << 8) | (pos[1] << 4) | pos[0]];
    if (id === 0) {
      return null;
    }
    return BlockType.fromId(id);
  }

  free(pos: ChunkPos): boolean {
    if (
      pos[0] < 0 ||
      pos[0] >= CHUNK_SIZE ||
      pos[1] < 0 ||
      pos[1] >= CHUNK_SIZE ||
      pos[2] < 0 ||
      pos[2] >= CHUNK_SIZE
    ) {
      return true;
    }
    return this.blocks[(pos[2] << 8) | (pos[1] << 4) | pos[0]] === 0;
  }

  private gen_vertex_info(): Float32Array {
    const blocks = [];
    for (let z = 0; z < 16; ++z) {
      for (let y = 0; y < 16; ++y) {
        for (let x = 0; x < 16; ++x) {
          const typ = this.getBlock([x, y, z]);
          if (typ === null) {
            continue;
          }
          let mask = 0b000_000;
          if (this.free([x, y, z + 1])) {
            mask |= 0b000_001;
          }
          if (this.free([x - 1, y, z])) {
            mask |= 0b000_010;
          }
          if (this.free([x, y + 1, z])) {
            mask |= 0b000_100;
          }
          if (this.free([x, y, z - 1])) {
            mask |= 0b001_000;
          }
          if (this.free([x + 1, y, z])) {
            mask |= 0b010_000;
          }
          if (this.free([x, y - 1, z])) {
            mask |= 0b100_000;
          }
          blocks.push({ typ, position: new Vec3(x, y, z), mask });
        }
      }
    }
    const maker = new ChunkMaker(blocks.length);
    for (const { position, typ, mask } of blocks) {
      maker.block(position, typ, mask);
    }
    return maker.geometry();
  }

  /**
   * Calculate the information for displaying this chunk on the GPU.
   *
   * This will only calculate the necessary information if the chunk
   * has changed in some way since the previous time this method was called.
   *
   * @returns the information neces
   */
  view(): ChunkView {
    if (this.stale) {
      this.vertex_info = this.gen_vertex_info();
      this.stale = false;
    }
    return {
      position: this.position,
      vertex_info: this.vertex_info,
      vertex_count: Math.floor(this.vertex_info.length / 6),
    };
  }
}

const TB_FACE_SHADING = 1.0;
const LR_FACE_SHADING = 0.8;
const FB_FACE_SHADING = 0.9;

const ATLAS_SIZE = 16;

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
    const texX =
      (texture % ATLAS_SIZE) / ATLAS_SIZE + shift / ATLAS_SIZE / ATLAS_SIZE;
    const texY =
      Math.floor(texture / ATLAS_SIZE) / ATLAS_SIZE +
      shift / ATLAS_SIZE / ATLAS_SIZE;
    const dX = 1.0 / ATLAS_SIZE - (2 * shift) / ATLAS_SIZE / ATLAS_SIZE;
    const dY = 1.0 / ATLAS_SIZE - (2 * shift) / ATLAS_SIZE / ATLAS_SIZE;

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

  block(position: Vec3, block: BlockType, faces: number) {
    // Front
    if (faces & 0b000_001) {
      this.face(
        block.texture(Side.Front),
        FB_FACE_SHADING,
        new Vec3(0, 0, 1).add(position),
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
      );
    }
    // Left
    if (faces & 0b000_010) {
      this.face(
        block.texture(Side.Left),
        LR_FACE_SHADING,
        new Vec3(0, 0, 0).add(position),
        new Vec3(0, 1, 0),
        new Vec3(0, 0, 1),
      );
    }
    // Top
    if (faces & 0b000_100) {
      this.face(
        block.texture(Side.Top),
        TB_FACE_SHADING,
        new Vec3(0, 1, 1).add(position),
        new Vec3(0, 0, -1),
        new Vec3(1, 0, 0),
      );
    }
    // Back
    if (faces & 0b001_000) {
      this.face(
        block.texture(Side.Back),
        FB_FACE_SHADING,
        new Vec3(1, 0, 0).add(position),
        new Vec3(0, 1, 0),
        new Vec3(-1, 0, 0),
      );
    }
    // Right
    if (faces & 0b010_000) {
      this.face(
        block.texture(Side.Right),
        LR_FACE_SHADING,
        new Vec3(1, 0, 1).add(position),
        new Vec3(0, 1, 0),
        new Vec3(0, 0, -1),
      );
    }
    // Bottom
    if (faces & 0b100_000) {
      this.face(
        block.texture(Side.Bottom),
        TB_FACE_SHADING,
        new Vec3(0, 0, 0).add(position),
        new Vec3(0, 0, 1),
        new Vec3(1, 0, 0),
      );
    }
  }

  geometry(): Float32Array {
    return this.buf.subarray(0, this.i);
  }
}
