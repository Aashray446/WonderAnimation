import { Line, BufferGeometry, LineBasicMaterial } from "three";
import { getOrbits } from '../services/getSatLocation';


const prevMaterial = new LineBasicMaterial({
    color: 0xffffff,
    linewidth: 10,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin: 'round' //ignored by WebGLRenderer
});
const currentMaterial = new LineBasicMaterial({
    color: 0xff0000,
    linewidth: 10,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin: 'round' //ignored by WebGLRenderer
});
const nextMaterial = new LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 10,
    linecap: 'round', //ignored by WebGLRenderer
    linejoin: 'round' //ignored by WebGLRenderer
});


export const sendOribits = async () => {
    const threeOrbitsArr = await getOrbits();
    return new Promise((resolve, reject) => {
        // prevGeometry = new BufferGeometry().setFromPoints(threeOrbitsArr[0][0], threeOrbitsArr[0][30], threeOrbitsArr[0][10]);
        const prevGeometry = new BufferGeometry().setFromPoints(threeOrbitsArr[0]);
        const currentGeometry = new BufferGeometry().setFromPoints(threeOrbitsArr[1]);
        const nextGeometry = new BufferGeometry().setFromPoints(threeOrbitsArr[2]);

        const prevOrbit = new Line(prevGeometry, prevMaterial);
        const currentOrbit = new Line(currentGeometry, currentMaterial);
        const nextOrbit = new Line(nextGeometry, nextMaterial);

        resolve({ prevOrbit, currentOrbit, nextOrbit })
    })
}

// export const prevOrbit = new Line(prevGeometry, material);
// export const currentOrbit = new Line(currentGeometry, material);
// export const nextOrbit = new Line(nextGeometry, material);