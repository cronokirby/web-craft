import { Color } from './math';

test('color creation', () => {
  let components = [...new Color(0.0, 0.5, 1.0, 0.0)];
  expect(components).toEqual([0.0, 0.5, 1.0, 0.0]);
  components = [...new Color(0.0, 0.5, 1.0)];
  expect(components).toEqual([0.0, 0.5, 1.0, 1.0]);
});
