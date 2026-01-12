import { Line, BufferGeometry, LineBasicMaterial, ShaderMaterial, Color, AdditiveBlending } from 'three';
import { getOrbitPaths } from '../services/getSatLocation.js';

// Orbit colors
const ORBIT_COLORS = {
    previous: new Color(0x666666),  // Gray - past orbit
    current: new Color(0x00ff88),   // Green - current orbit  
    next: new Color(0x00a3ff)       // Blue - next orbit
};

// Orbit glow shader for modern look
const orbitVertexShader = `
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const orbitFragmentShader = `
    uniform vec3 color;
    uniform float opacity;
    
    void main() {
        gl_FragColor = vec4(color, opacity);
    }
`;

/**
 * Create orbit material with glow effect
 * @param {Color} color - Orbit color
 * @param {number} opacity - Material opacity (0-1)
 * @returns {ShaderMaterial} Orbit material
 */
function createOrbitMaterial(color, opacity = 0.8) {
    return new ShaderMaterial({
        uniforms: {
            color: { value: color },
            opacity: { value: opacity }
        },
        vertexShader: orbitVertexShader,
        fragmentShader: orbitFragmentShader,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false
    });
}

/**
 * Create simple line material (fallback)
 * @param {number} colorHex - Hex color value
 * @param {number} opacity - Material opacity
 * @returns {LineBasicMaterial} Line material
 */
function createLineMaterial(colorHex, opacity = 0.7) {
    return new LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: opacity,
        linewidth: 2
    });
}

/**
 * Create orbit line from path points
 * @param {Vector3[]} points - Array of Vector3 points
 * @param {Material} material - Line material
 * @returns {Line} Three.js Line object
 */
function createOrbitLine(points, material) {
    if (!points || points.length === 0) {
        return new Line(new BufferGeometry(), material);
    }
    const geometry = new BufferGeometry().setFromPoints(points);
    return new Line(geometry, material);
}

/**
 * Get all orbit lines for the scene
 * @returns {Promise<object>} Object containing prevOrbit, currentOrbit, nextOrbit Line objects
 */
export async function getOrbitLines() {
    const paths = await getOrbitPaths();

    // Create materials
    const prevMaterial = createLineMaterial(0x666666, 0.4);
    const currentMaterial = createLineMaterial(0x00ff88, 0.8);
    const nextMaterial = createLineMaterial(0x00a3ff, 0.6);

    // Create lines
    const prevOrbit = createOrbitLine(paths.previousOrbit, prevMaterial);
    const currentOrbit = createOrbitLine(paths.currentOrbit, currentMaterial);
    const nextOrbit = createOrbitLine(paths.nextOrbit, nextMaterial);

    // Name for debugging
    prevOrbit.name = 'previousOrbit';
    currentOrbit.name = 'currentOrbit';
    nextOrbit.name = 'nextOrbit';

    return { prevOrbit, currentOrbit, nextOrbit };
}

/**
 * Update existing orbit lines with new path data
 * @param {Line} prevOrbit - Previous orbit line
 * @param {Line} currentOrbit - Current orbit line
 * @param {Line} nextOrbit - Next orbit line
 * @returns {Promise<void>}
 */
export async function updateOrbitLines(prevOrbit, currentOrbit, nextOrbit) {
    const paths = await getOrbitPaths();

    if (paths.previousOrbit.length > 0) {
        prevOrbit.geometry.setFromPoints(paths.previousOrbit);
        prevOrbit.geometry.attributes.position.needsUpdate = true;
    }

    if (paths.currentOrbit.length > 0) {
        currentOrbit.geometry.setFromPoints(paths.currentOrbit);
        currentOrbit.geometry.attributes.position.needsUpdate = true;
    }

    if (paths.nextOrbit.length > 0) {
        nextOrbit.geometry.setFromPoints(paths.nextOrbit);
        nextOrbit.geometry.attributes.position.needsUpdate = true;
    }
}

// Legacy export for backwards compatibility
export const sendOribits = getOrbitLines;