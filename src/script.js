import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as statellite from './models/satellite.js'
import * as earth from './models/earth'
import * as locationService from './services/getSatLocation.js'
import * as orbits from './models/curve.js'

const canvas = document.querySelector(".webgl");
// Debug
let scene;
let camera;
let renderer;
let statelliteModel;

// scene setup
scene = new THREE.Scene();

// camera setup
const fov = 5;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10);
scene.add(camera);

// // Co-ordinate Helper
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// renderer setup
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);

// orbit control setup
const controls = new OrbitControls(camera, renderer.domElement);
statellite.getModel.then((model) => {
    scene.add(model);
    statelliteModel = model;
})

scene.add(earth.earthMesh)
scene.add(earth.cloudMesh)
scene.add(earth.starMesh)

// orbits
orbits.sendOribits().then((orbits) => {
    scene.add(orbits.prevOrbit)
    scene.add(orbits.currentOrbit)
    scene.add(orbits.nextOrbit)
})



// ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
// point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 3, 5);

scene.add(ambientlight)
scene.add(pointLight)
// handling resizing
window.addEventListener(
    "resize",
    () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    },
    false
);




// spinning animation
const animate = () => {
    requestAnimationFrame(animate);
    earth.starMesh.rotation.y -= 0.0002;
    // earth.earthMesh.rotation.y -= 0.0000727;
    earth.cloudMesh.rotation.y -= 0.00005;

    if (statelliteModel) {
        const vector = locationService.getxyzComponent();
        statelliteModel.position.set(vector.x, vector.y, vector.z)
        controls.target = statelliteModel.position;
        controls.update();
    }

    // moonMesh.rotation.y -= 0.003;
    controls.update();
    render();
};
// rendering
const render = function () {
    renderer.render(scene, camera);
};

animate();


//for slider
const slider_box = document.querySelector(".slider-value-box");
const range = document.querySelector("#myRange");

range.addEventListener("input", () => {
    const value = range.value;
    slider_box.style.left = value + "%";
});

