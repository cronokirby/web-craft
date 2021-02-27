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

  private constructor(sideFace: number, topFace?: number, bottomFace?: number) {
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

  public static Coal = new BlockType(34);
  public static Dirt = new BlockType(2);
  public static Grass = new BlockType(3, 0, 2);
  public static Gravel = new BlockType(19);
  public static Sand = new BlockType(18);
  public static Stone = new BlockType(1);

  /**
   * Get the texture used for a given side of the block.
   *
   * @param side the side to look at.
   */
  texture(side: Side): number {
    return this.textures[side];
  }
}
