async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = 'res/terrain.png';
  return new Promise((resolve) =>
    image.addEventListener('load', () => {
      resolve(image);
    }),
  );
}

/**
 * Represents a set of resources that we want to load before running the game.
 *
 * This exists to allow us to load everything necessary to run the game, like textures,
 * and other things like that.
 */
export default class Resources {
  private constructor(public readonly texture: HTMLImageElement) {}

  /**
   * Load all of the resources necessary to play the game.
   */
  static async load(): Promise<Resources> {
    const texture = await loadImage('res/f-texture.png');
    return new Resources(texture);
  }
}
