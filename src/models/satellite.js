import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Loading state for UI feedback
let loadingProgress = 0;
let isLoaded = false;

/**
 * Load ISS 3D model
 * @returns {Promise} Resolves with the loaded model
 */
const getModel = new Promise((resolve, reject) => {
    loader.load(
        './texture/ISS_stationary.glb',
        (glb) => {
            const model = glb.scene;
            model.position.set(0.63, 0.63, 0.63);
            model.scale.set(0.001, 0.001, 0.001);
            isLoaded = true;
            resolve(model);
        },
        (event) => {
            if (event.lengthComputable) {
                loadingProgress = (event.loaded / event.total) * 100;
                console.log(`ISS Model loading: ${loadingProgress.toFixed(1)}%`);
            }
        },
        (error) => {
            console.error('Error loading ISS model:', error);
            reject(error);
        }
    );
});

/**
 * Get current loading progress (0-100)
 * @returns {number} Loading progress percentage
 */
const getLoadingProgress = () => loadingProgress;

/**
 * Check if model is fully loaded
 * @returns {boolean} Whether the model is loaded
 */
const isModelLoaded = () => isLoaded;

export { getModel, getLoadingProgress, isModelLoaded };