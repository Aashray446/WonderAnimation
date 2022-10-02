import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as statellite from './models/satellite.js'
import * as earth from './models/earth'
const axios = require('axios');
let long, lat;

const getPositionOfISS = async () => {
    const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
    long = response.data.longitude;
    lat = response.data.latitude;
}

let mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)


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
earth.earthMesh.position.set(0, 0, 0);

scene.add(earth.earthMesh)
scene.add(earth.cloudMesh)
scene.add(earth.starMesh)


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

// function calcPosFromLatLonRad(radius, lat, lon) {

//     var spherical = new THREE.Spherical(
//         radius,
//         THREE.Math.degToRad(90 - lon),
//         THREE.Math.degToRad(lat)
//     );

//     var vector = new THREE.Vector3();
//     vector.setFromSpherical(spherical);

//     return vector;
// }

// function calcPosFromLatLonRad(lat, lon, alt) {

//     const rad = 6378137.0
//     const f = 1.0 / 298.257223563
//     let cosLat = Math.cos(lat)
//     let sinLat = Math.sin(lat)
//     let FF = (1.0 - f) ** 2
//     let C = 1 / Math.sqrt(cosLat ** 2 + FF * sinLat ** 2)
//     let S = C * FF

//     let x = (rad * C + alt) * cosLat * Math.cos(lon)
//     let y = (rad * C + alt) * cosLat * Math.sin(lon)
//     let z = (rad * S + alt) * sinLat
//     x = x / 100000;
//     y = y / 100000;
//     z - z / 100000;
//     return { x, y, z }
// }

function convertLatLangToCartersian(latitude, longitude) {
    let lat = (90 - latitude) * Math.PI / 180;
    let lang = (180 + longitude) * Math.PI / 180;

    let x = -Math.sin(lat) * Math.cos(lang)
    let y = Math.sin(lat) * Math.sin(lang)
    let z = Math.cos(lat)

    return { x, y, z }
}




// function foo() {

//     // your function code here
//     getPositionOfISS();

//     setTimeout(foo, 2000);
// }

// foo();


// spinning animation
const animate = () => {
    requestAnimationFrame(animate);
    earth.starMesh.rotation.y -= 0.0002;

    if (statelliteModel) {
        const vector = convertLatLangToCartersian(26.24, 90.38)
        // console.log(vector.x, vector.y, vector.z)
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


//for slider
const slider_box = document.querySelector(".slider-value-box");
const range = document.querySelector("#myRange");

range.addEventListener("input", () => {
    const value = range.value;
    slider_box.style.left = value + "%";
});

