import { SphereGeometry, MeshPhongMaterial, Mesh, BackSide, MeshBasicMaterial, TextureLoader, ShaderMaterial, AdditiveBlending, Color } from 'three';

// Texture loader (replaces deprecated ImageUtils)
const textureLoader = new TextureLoader();

// Texture paths
const TEXTURES = {
    earth: './texture/earthmap1k.jpg',
    earthBump: './texture/earthbump.jpg',
    earthSpecular: './texture/specularmap.jpg',
    clouds: './texture/earthCloud.png',
    galaxy: './texture/galaxy.png'
};

// Earth Mesh - Higher quality sphere (64 segments for smooth appearance)
const earthGeometry = new SphereGeometry(0.64, 64, 64);
const earthMaterial = new MeshPhongMaterial({
    map: textureLoader.load(TEXTURES.earth),
    bumpMap: textureLoader.load(TEXTURES.earthBump),
    bumpScale: 0.015,
    specularMap: textureLoader.load(TEXTURES.earthSpecular),
    specular: new Color(0x333333),
    shininess: 15,
    transparent: false
});

// Cloud Geometry - Slightly larger than Earth
const cloudGeometry = new SphereGeometry(0.655, 64, 64);
const cloudMaterial = new MeshPhongMaterial({
    map: textureLoader.load(TEXTURES.clouds),
    transparent: true,
    opacity: 0.4,
    depthWrite: false
});

// Galaxy/Starfield Geometry
const starGeometry = new SphereGeometry(80, 64, 64);
const starMaterial = new MeshBasicMaterial({
    map: textureLoader.load(TEXTURES.galaxy),
    side: BackSide,
});

// Atmosphere Glow Shader
const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const atmosphereFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 glowColor;
    uniform float intensity;
    uniform float power;
    
    void main() {
        vec3 viewDirection = normalize(-vPosition);
        float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), power);
        gl_FragColor = vec4(glowColor, fresnel * intensity);
    }
`;

// Atmosphere Mesh
const atmosphereGeometry = new SphereGeometry(0.68, 64, 64);
const atmosphereMaterial = new ShaderMaterial({
    uniforms: {
        glowColor: { value: new Color(0x00a3ff) },
        intensity: { value: 0.8 },
        power: { value: 3.5 }
    },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false
});

// Create meshes
export const earthMesh = new Mesh(earthGeometry, earthMaterial);
export const starMesh = new Mesh(starGeometry, starMaterial);
export const cloudMesh = new Mesh(cloudGeometry, cloudMaterial);
export const atmosphereMesh = new Mesh(atmosphereGeometry, atmosphereMaterial);

// Earth radius constant (for calculations)
export const EARTH_RADIUS = 0.64;
