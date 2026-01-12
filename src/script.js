/**
 * ISS Tracker 3D - Main Application
 * Real-time visualization of the International Space Station
 */

import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as satellite from './models/satellite.js';
import * as earth from './models/earth.js';
import * as orbits from './models/curve.js';
import {
    initSatelliteService,
    getPositionVector,
    getDisplayData,
    getSatelliteState
} from './services/getSatLocation.js';

// ========================================
// Configuration
// ========================================
const CONFIG = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        defaultPosition: new THREE.Vector3(0, 0, 3),
        issViewDistance: 0.3,
        cinematicDistance: 2.5
    },
    animation: {
        earthRotation: 0.0001,
        cloudRotation: 0.00015,
        starRotation: 0.00005,
        cameraTransitionSpeed: 0.02,
        positionLerp: 0.08
    },
    updateInterval: 3000
};

// ========================================
// App State
// ========================================
const state = {
    isLoading: true,
    currentView: 'earth', // 'earth', 'iss', 'cinematic'
    useMetric: true,
    showOrbits: true,
    showAtmosphere: true,
    autoRotate: false,
    targetCameraPosition: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    satelliteModel: null,
    orbitLines: null
};

// ========================================
// Scene Setup
// ========================================
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
);
camera.position.copy(CONFIG.camera.defaultPosition);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.enablePan = false;
controls.autoRotate = state.autoRotate;
controls.autoRotateSpeed = 0.5;

// ========================================
// Lighting
// ========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x00a3ff, 0.3);
rimLight.position.set(-5, 0, -5);
scene.add(rimLight);

// ========================================
// Scene Objects
// ========================================
// Add Earth system
scene.add(earth.earthMesh);
scene.add(earth.cloudMesh);
scene.add(earth.starMesh);
scene.add(earth.atmosphereMesh);

// ========================================
// Initialization
// ========================================
async function init() {
    updateLoadingText('Loading ISS model...');
    updateLoadingProgress(10);

    try {
        // Load ISS model
        const model = await satellite.getModel;
        state.satelliteModel = model;
        scene.add(model);
        updateLoadingProgress(40);

        // Initialize satellite tracking service
        updateLoadingText('Fetching orbital data...');
        await initSatelliteService();
        updateLoadingProgress(70);

        // Load orbit paths
        updateLoadingText('Calculating orbits...');
        state.orbitLines = await orbits.getOrbitLines();
        scene.add(state.orbitLines.prevOrbit);
        scene.add(state.orbitLines.currentOrbit);
        scene.add(state.orbitLines.nextOrbit);
        updateLoadingProgress(90);

        // Setup UI
        setupEventListeners();
        updateLoadingProgress(100);

        // Hide loading screen
        setTimeout(() => {
            hideLoadingScreen();
            state.isLoading = false;
        }, 500);

        // Start data update loop
        setInterval(updateUIData, CONFIG.updateInterval);
        updateUIData(); // Initial update

    } catch (error) {
        console.error('Initialization error:', error);
        updateLoadingText('Error loading. Please refresh.');
    }
}

// ========================================
// Loading Screen
// ========================================
function updateLoadingProgress(percent) {
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
}

function updateLoadingText(text) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

function hideLoadingScreen() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// ========================================
// UI Data Updates
// ========================================
function updateUIData() {
    const data = getDisplayData(state.useMetric);

    document.getElementById('lat').textContent = data.latitude;
    document.getElementById('long').textContent = data.longitude;
    document.getElementById('alt').textContent = data.altitude;
    document.getElementById('vel').textContent = data.velocity;
}

// ========================================
// Camera Views
// ========================================
function setCameraView(view) {
    state.currentView = view;

    // Update button states
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${view}-view`).classList.add('active');

    switch (view) {
        case 'earth':
            state.targetCameraPosition.copy(CONFIG.camera.defaultPosition);
            state.targetLookAt.set(0, 0, 0);
            controls.autoRotate = state.autoRotate;
            break;
        case 'iss':
            // Will be handled in animation loop
            controls.autoRotate = false;
            break;
        case 'cinematic':
            state.targetCameraPosition.set(
                CONFIG.camera.cinematicDistance,
                CONFIG.camera.cinematicDistance * 0.5,
                CONFIG.camera.cinematicDistance
            );
            state.targetLookAt.set(0, 0, 0);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.3;
            break;
    }
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Camera view buttons
    document.getElementById('btn-earth-view').addEventListener('click', () => setCameraView('earth'));
    document.getElementById('btn-iss-view').addEventListener('click', () => setCameraView('iss'));
    document.getElementById('btn-cinematic-view').addEventListener('click', () => setCameraView('cinematic'));

    // Settings button
    document.getElementById('btn-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('hidden');
    });

    // Close settings
    document.getElementById('btn-close-settings').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('hidden');
    });

    // Close modal on backdrop click
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            document.getElementById('settings-modal').classList.add('hidden');
        }
    });

    // Unit toggle
    document.getElementById('btn-metric').addEventListener('click', () => {
        state.useMetric = true;
        document.getElementById('btn-metric').classList.add('active');
        document.getElementById('btn-imperial').classList.remove('active');
        updateUIData();
    });

    document.getElementById('btn-imperial').addEventListener('click', () => {
        state.useMetric = false;
        document.getElementById('btn-imperial').classList.add('active');
        document.getElementById('btn-metric').classList.remove('active');
        updateUIData();
    });

    // Orbits toggle
    document.getElementById('btn-orbits-on').addEventListener('click', () => {
        state.showOrbits = true;
        toggleOrbits(true);
        document.getElementById('btn-orbits-on').classList.add('active');
        document.getElementById('btn-orbits-off').classList.remove('active');
    });

    document.getElementById('btn-orbits-off').addEventListener('click', () => {
        state.showOrbits = false;
        toggleOrbits(false);
        document.getElementById('btn-orbits-off').classList.add('active');
        document.getElementById('btn-orbits-on').classList.remove('active');
    });

    // Atmosphere toggle
    document.getElementById('btn-glow-on').addEventListener('click', () => {
        state.showAtmosphere = true;
        earth.atmosphereMesh.visible = true;
        document.getElementById('btn-glow-on').classList.add('active');
        document.getElementById('btn-glow-off').classList.remove('active');
    });

    document.getElementById('btn-glow-off').addEventListener('click', () => {
        state.showAtmosphere = false;
        earth.atmosphereMesh.visible = false;
        document.getElementById('btn-glow-off').classList.add('active');
        document.getElementById('btn-glow-on').classList.remove('active');
    });

    // Auto-rotate toggle
    document.getElementById('btn-rotate-on').addEventListener('click', () => {
        state.autoRotate = true;
        controls.autoRotate = true;
        document.getElementById('btn-rotate-on').classList.add('active');
        document.getElementById('btn-rotate-off').classList.remove('active');
    });

    document.getElementById('btn-rotate-off').addEventListener('click', () => {
        state.autoRotate = false;
        if (state.currentView !== 'cinematic') {
            controls.autoRotate = false;
        }
        document.getElementById('btn-rotate-off').classList.add('active');
        document.getElementById('btn-rotate-on').classList.remove('active');
    });

    // Fullscreen button
    document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Window resize
    window.addEventListener('resize', handleResize);
}

function toggleOrbits(visible) {
    if (state.orbitLines) {
        state.orbitLines.prevOrbit.visible = visible;
        state.orbitLines.currentOrbit.visible = visible;
        state.orbitLines.nextOrbit.visible = visible;
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function handleKeyboard(e) {
    switch (e.key.toLowerCase()) {
        case 'r':
            setCameraView('earth');
            camera.position.copy(CONFIG.camera.defaultPosition);
            controls.target.set(0, 0, 0);
            break;
        case 'f':
            toggleFullscreen();
            break;
        case '+':
        case '=':
            camera.position.multiplyScalar(0.9);
            break;
        case '-':
            camera.position.multiplyScalar(1.1);
            break;
        case '1':
            setCameraView('earth');
            break;
        case '2':
            setCameraView('iss');
            break;
        case '3':
            setCameraView('cinematic');
            break;
    }
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========================================
// Animation Loop
// ========================================
function animate() {
    requestAnimationFrame(animate);

    // Rotate celestial bodies
    earth.starMesh.rotation.y += CONFIG.animation.starRotation;
    earth.cloudMesh.rotation.y += CONFIG.animation.cloudRotation;

    // Update satellite position
    if (state.satelliteModel) {
        const vector = getPositionVector();

        // Smooth position interpolation
        state.satelliteModel.position.lerp(
            new THREE.Vector3(vector.x, vector.y, vector.z),
            CONFIG.animation.positionLerp
        );

        // ISS View - camera follows satellite
        if (state.currentView === 'iss') {
            const offset = new THREE.Vector3(0.1, 0.05, 0.1);
            state.targetCameraPosition.copy(state.satelliteModel.position).add(offset);
            state.targetLookAt.copy(state.satelliteModel.position);

            // Smooth camera follow
            camera.position.lerp(state.targetCameraPosition, 0.02);
            controls.target.lerp(state.targetLookAt, 0.02);
        } else if (state.currentView === 'earth') {
            // Smooth camera transition back to default
            camera.position.lerp(state.targetCameraPosition, 0.02);
        }
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);
}

// ========================================
// Start Application
// ========================================
init();
animate();
