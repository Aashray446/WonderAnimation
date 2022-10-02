import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


const loader = new GLTFLoader();


const getModel = new Promise((resolve, reject) => {


    loader.load(
        "./texture/ISS_stationary.glb",
        (glb) => {
            const model = glb.scene;
            model.position.set(0.63, 0.63, 0.63);
            model.scale.set(0.001, 0.001, 0.001);
            resolve(model);
        },
        (event) => console.log((event.loaded / event.total) * 100),
        (error) => {
            reject(error)
        }
    );

})

export { getModel }