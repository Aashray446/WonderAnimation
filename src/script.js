import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as statellite from './models/satellite.js'
import * as earth from './models/earth'
const axios = require('axios');

// Get Present Lat Long
let long, lat;

const getPositionOfISS = async () => {
    const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
    long = response.data.longitude;
    lat = response.data.latitude;
}


const canvas = document.querySelector(".webgl");
// Debug
let scene;
let camera;
let renderer;
let statelliteModel;

// scene setup
scene = new THREE.Scene();

// camera setup
const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 10000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10);
scene.add(camera);

// Co-ordinate Helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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


// ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 1);
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


function convertLatLangToCartersian(lat, lon, alt) {
    const radius = 0.64 + alt;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return { x, y, z }
}




function foo() {

    // your function code here
    getPositionOfISS();

    setTimeout(foo, 3000);
}

foo();


// spinning animation
const animate = () => {
    requestAnimationFrame(animate);
    earth.starMesh.rotation.y -= 0.0002;
    // earth.earthMesh.rotation.y -= 0.0000727;
    earth.cloudMesh.rotation.y -= 0.00005;

    if (statelliteModel) {
        console.log(lat, long);
        const vector = convertLatLangToCartersian(lat, long, 0.4)
        console.log(vector.x, vector.y, vector.z);
        statelliteModel.position.set(vector.x, vector.y, vector.z);

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
