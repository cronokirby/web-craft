import { Color, Mat4 } from './math';

test('color creation', () => {
  let components = [...new Color(0.0, 0.5, 1.0, 0.0)];
  expect(components).toEqual([0.0, 0.5, 1.0, 0.0]);
  components = [...new Color(0.0, 0.5, 1.0)];
  expect(components).toEqual([0.0, 0.5, 1.0, 1.0]);
});

test('matrix multiplication', () => {
  expect(Mat4.identity().mul(Mat4.identity())).toEqual(Mat4.identity());
  const scale = Mat4.scale(0.5, 0.25, 1.0);
  expect(scale.mul(Mat4.identity())).toEqual(scale);
  expect(Mat4.identity().mul(scale)).toEqual(scale);
  const rot = Mat4.rotZ(90);
  expect(rot.mul(Mat4.identity())).toEqual(rot);
  expect(Mat4.identity().mul(rot)).toEqual(rot);
});
