/**
 * Represents a given side of some block
 */
export enum Side {
  Top,
  Bottom,
  Left,
  Right,
  Front,
  Back,
}

/**
 * All of the possible sides
 */
const SIDES = [
  Side.Top,
  Side.Bottom,
  Side.Left,
  Side.Right,
  Side.Front,
  Side.Back,
];

/**
 * Represents some type of block, in a feature rich way.
 *
 * This isn't the most efficient representation, so storing block information
 * this way is a bit wasteful. This is more useful for actually using this information,
 * after having extracted it out of a chunk.
 */
export class BlockType {
  private textures: Map<Side, number>;
  public readonly id: number;

  private constructor(
    id: number,
    sideFace: number,
    topFace?: number,
    bottomFace?: number,
  ) {
    this.id = id;
    this.textures = new Map();
    for (const side of SIDES) {
      this.textures[side] = sideFace;
    }
    if (topFace !== undefined) {
      this.textures[Side.Top] = topFace;
    }
    if (bottomFace !== undefined) {
      this.textures[Side.Bottom] = bottomFace;
    }
  }

  static fromId(id: number): BlockType {
    return BlockType.All[id - 1];
  }

  public static Brick = new BlockType(1, 7);
  public static Coal = new BlockType(2, 34);
  public static CobbleStone = new BlockType(3, 16);
  public static Dirt = new BlockType(4, 2);
  public static Grass = new BlockType(5, 3, 0, 2);
  public static Gravel = new BlockType(6, 19);
  public static Sand = new BlockType(7, 18);
  public static Snow = new BlockType(8, 68, 66, 2);
  public static Stone = new BlockType(9, 1);
  public static All = [
    BlockType.Brick,
    BlockType.Coal,
    BlockType.CobbleStone,
    BlockType.Dirt,
    BlockType.Grass,
    BlockType.Gravel,
    BlockType.Sand,
    BlockType.Snow,
    BlockType.Stone,
  ];

  /**
   * Get the texture used for a given side of the block.
   *
   * @param side the side to look at.
   */
  texture(side: Side): number {
    return this.textures[side];
  }
}
