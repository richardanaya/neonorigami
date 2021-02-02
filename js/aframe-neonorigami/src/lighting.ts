import { heightMapGrid } from "./geometry"

export class Lighting {
    constructor(private renderer, private scene) {
        const envScene = new THREE.Scene();

        // TODO: make lights that match environment for environment maps


        envScene.background = new THREE.Color(0x444444)


        // Generate environment map from scene
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const generatedCubeRenderTarget = pmremGenerator.fromScene(envScene, 0.04);

        // Make every object use same environment map
        scene.environment = generatedCubeRenderTarget.texture;
    }
}