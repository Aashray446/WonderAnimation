import { Vector3, LineBasicMaterial, Line } from "three";


const material = new LineBasicMaterial({
    color: 0x0000ff
});

const points = [];
points.push(new Vector3(- 10, 0, 0));
points.push(new Vector3(0, 10, 0));
points.push(new Vector3(10, 0, 0));

const geometry = new BufferGeometry().setFromPoints(points);

export const line = new Line(geometry, material);