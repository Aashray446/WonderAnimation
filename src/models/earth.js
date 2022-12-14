import { SphereGeometry, MeshPhongMaterial, ImageUtils, Mesh, BackSide, MeshBasicMaterial } from 'three';



// earth Mesh
const earthGeometry = new SphereGeometry(0.64, 20, 20);
const earthMaterial = new MeshPhongMaterial({
    roughness: 1,
    metalness: 0,
    map: ImageUtils.loadTexture("./texture/earthmap1k.jpg"),
    bumpScale: 0.1,
    transparent: false
});


// cloud Geometry
const cloudGeometry = new SphereGeometry(0.66, 20, 20);
const cloudMetarial = new MeshPhongMaterial({
    map: ImageUtils.loadTexture("./texture/earthCloud.png"),
    transparent: true,
});


// galaxy geometry
const starGeometry = new SphereGeometry(80, 64, 64);
const starMaterial = new MeshBasicMaterial({
    map: ImageUtils.loadTexture("./texture/galaxy.png"),
    side: BackSide,
});


// Earth Mesh 
export const earthMesh = new Mesh(earthGeometry, earthMaterial);
// galaxy mesh
export const starMesh = new Mesh(starGeometry, starMaterial);
// cloud mesh
export const cloudMesh = new Mesh(cloudGeometry, cloudMetarial);

