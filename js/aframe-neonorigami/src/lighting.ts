import { heightMapGrid } from "./geometry"

export class Lighting {
    constructor(private renderer, private scene) {
        const envScene = new THREE.Scene();

        // TODO: make lights that match environment for environment maps

        const geometry = new THREE.BoxGeometry();
        //geometry.deleteAttribute( 'uv' );

        const mainLight = new THREE.PointLight(0xffffff, 50, 0, 2);
        envScene.add(mainLight);

        const lightMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, emissive: 0xffffff, emissiveIntensity: 10 });

        const light1 = new THREE.Mesh(geometry, lightMaterial);
        light1.material.color.setHex(0xffffff);
        light1.position.set(- 5, 2, 0);
        light1.scale.set(0.1, 1, 1);
        envScene.add(light1);

        // Generate environment map from scene
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const generatedCubeRenderTarget = pmremGenerator.fromScene(envScene, 0.04);

        // Make every object use same environment map
        scene.environment = generatedCubeRenderTarget.texture;
    }
}