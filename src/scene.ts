import { Camera } from './Camera';

/**
 * Represents a scene, containing information about the things we want to draw.
 */
export interface Scene {
  /**
   * The camera viewing the scene
   */
  readonly camera: Camera;
}
