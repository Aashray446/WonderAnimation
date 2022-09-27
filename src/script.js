import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// buttons
const X = document.querySelector('#X').addEventListener('click', function () {
    camera.position.x = camera.position.x + 10;
});
const Y = document.querySelector('#Y');
const Z = document.querySelector('#Z');

const canvas = document.querySelector(".webgl");
// Debug
let scene;
let camera;
let renderer;

// scene setup
scene = new THREE.Scene();

// camera setup
const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10);
scene.add(camera);

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

// earth geometry
const earthGeometry = new THREE.SphereGeometry(0.6, 32, 32);
const moonGeometry = new THREE.SphereGeometry(0.1, 32, 32);
// earth material
const earthMaterial = new THREE.MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
    map: THREE.ImageUtils.loadTexture("./texture/earthmap1k.jpg"),
    bumpMap: THREE.ImageUtils.loadTexture("./texture/earthbump.jpg"),
    bumpScale: 0.3,
});
// const moonMaterial = new THREE.MeshPhongMaterial({
//   roughness: 1,
//   metalness: 0,
//   map: THREE.ImageUtils.loadTexture("./texture/moon.jpg"),
//   bumpMap: THREE.ImageUtils.loadTexture("./texture/moon.jpg"),
//   bumpScale: 0.3,
// });

// earth mesh
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.position.set(0, 0, 0);
// const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(earthMesh);
console.log(earthMesh)
// moonMesh.position.set(0.5, 0.5, 0.5);
// scene.add(moonMesh);

// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(0.63, 32, 32);

// cloud metarial
const cloudMetarial = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture("./texture/earthCloud.png"),
    transparent: true,
});

// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
scene.add(cloudMesh);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64);

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture("./texture/galaxy.png"),
    side: THREE.BackSide,
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientlight);

// point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

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
    starMesh.rotation.y -= 0.002;
    earthMesh.rotation.y -= 0.0015;
    cloudMesh.rotation.y -= 0.001;
    // moonMesh.rotation.y -= 0.003;
    controls.update();
    render();
};

// rendering
const render = function () {
    renderer.render(scene, camera);
};

animate();
