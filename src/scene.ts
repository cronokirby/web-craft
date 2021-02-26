import { Camera } from './Camera';
import { Vec3 } from './math';

/**
 * Represents the information we need to display a chunk.
 */
interface ChunkView {
  /**
   * The position of the chunk in space
   */
  readonly position: Vec3;
  /**
   * The information about the vertices in the chunk
   */
  readonly vertex_info: Float32Array;
  /**
   * The number of vertices in the chunk
   */
  readonly vertex_count: number;
}

/**
 * Represents a scene, containing information about the things we want to draw.
 */
export interface Scene {
  readonly chunk: ChunkView;
  /**
   * The camera viewing the scene
   */
  readonly camera: Camera;
}
