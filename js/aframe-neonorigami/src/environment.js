import {ProceduralTerrain} from "./terrain"

function generateGrid(pointWidth, heightCalc, material) {
    const geometry = new THREE.Geometry();
    for (let y = 0; y < pointWidth; y++) {
        for (let x = 0; x < pointWidth; x++) {
            let px = -pointWidth / 2 + x;
            let py = -pointWidth / 2 + y;
            geometry.vertices.push(
                new THREE.Vector3(px, heightCalc(x, y), py),
            );
        }
    }

    for (let y = 0; y < pointWidth - 1; y++) {
        for (let x = 0; x < pointWidth - 1; x++) {
            let curPoint = y * pointWidth + x
            geometry.faces.push(
                new THREE.Face3(curPoint, curPoint + pointWidth, curPoint + 1,),
                new THREE.Face3(curPoint + 1, curPoint + pointWidth, curPoint + pointWidth + 1),
            );
            geometry.faceVertexUvs[0].push(
                [new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 0)],
                [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)],
            );
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
}

function getEnvScene() {

    const envScene = new THREE.Scene();

    // TODO: make lights that match environment for environment maps

    /*const geometry = new THREE.BoxGeometry();
    //geometry.deleteAttribute( 'uv' );

    const mainLight = new THREE.PointLight( 0xffffff, 50, 0, 2 );
    envScene.add( mainLight );

    const lightMaterial = new THREE.MeshLambertMaterial( { color: 0x000000, emissive: 0xffffff, emissiveIntensity: 10 } );

    const light1 = new THREE.Mesh( geometry, lightMaterial );
    light1.material.color.setHex( 0xff0000 );
    light1.position.set( - 5, 2, 0 );
    light1.scale.set( 0.1, 1, 1 );
    envScene.add( light1 );

    const light2 = new THREE.Mesh( geometry, lightMaterial.clone() );
    light2.material.color.setHex( 0x00ff00 );
    light2.position.set( 0, 5, 0 );
    light2.scale.set( 1, 0.1, 1 );
    envScene.add( light2 );

    const light3 = new THREE.Mesh( geometry, lightMaterial.clone() );
    light3.material.color.setHex( 0x0000ff );
    light3.position.set( 2, 1, 5 );
    light3.scale.set( 1.5, 2, 0.1 );
    envScene.add( light3 );*/

    return envScene;

}

AFRAME.registerComponent('neon-origami-environment', {
    schema: {
        "sky-color": { type: 'color', default: '#87CEEB' }
    },
    init: function () {
        this.didChange = true;

        // get the three js scene
        const renderer = this.el.closest("a-scene").renderer;
        renderer.physicallyCorrectLights = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const scene = this.el.closest("a-scene").object3D;
        

        // 0. Let's generate environment map from a scene with lights to get cool PBR effects
        const pmremGenerator = new THREE.PMREMGenerator( renderer );
        this.generatedCubeRenderTarget = pmremGenerator.fromScene( getEnvScene(), 0.04 );

        // 100 points width and height centered around 0,0
        const pointWidth = 200;
        
        // 1. Make Land
        var map = new ProceduralTerrain({
                height:pointWidth, // Size of map
                width:pointWidth, // Size of map
                details:20, // Range of values each tile can be
                continent_factor:2, // Acts as a multiplier on the Simplex results
        });
        map.generateMaps(1)
        const noise = map.getHeightMap(); 
        const loader = new THREE.TextureLoader();

        this.landShader = new THREE.MeshStandardMaterial({
            map: loader.load('Ground027_2K_Color.jpg'),
            normalMap: loader.load('Ground027_2K_Normal.jpg'),
            aoMap: loader.load('Ground027_2K_AmbientOcclusion.jpg'),
            roughnessMap: loader.load('Ground027_2K_Roughness.jpg'),
        })
      
        scene.add(generateGrid(pointWidth, (x, y) => {
            // height from noise, ranged 0.0-1.0
            let heightFromNoise = noise[x][y]/20;
            // get positions relative to center
            let cx = x - pointWidth / 2;
            let cy = y - pointWidth / 2;
            let distanceFromCenter = Math.sqrt(cx * cx + cy * cy);
            // let's make sure the area around map position 0,0 isn't too crazy
            // further from center of map allows for more variation of height scale
            let scale = distanceFromCenter/2;
            // lets center our height scale around zero so we have some above and below water
            let height = heightFromNoise * scale - (scale / 2);
            return height;
        }, this.landShader));

        // 2. Make Water
        this.waterShader = new THREE.ShaderMaterial({
            transparent: true,

            uniforms: {
                // The time in milliseconds since unix epoch
                time: { value: new Date().getTime() },
            },

            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
                            
            `,

            fragmentShader: `
                void main() {
                    // ocean blue
                    gl_FragColor = vec4(0, 0.42, 0.58, .5);
                }
            `
        })
        scene.add(generateGrid(pointWidth, () => 0, this.waterShader));
    },
    update: function (oldData) {
        if (oldData["sky-color"] != this.data["sky-color"]) {
            this.didChange = true;
        }
    },
    tick: function () {
        if (this.didChange) {
            // get the three js scene
            const scene = this.el.closest("a-scene").object3D;
            scene.background = new THREE.Color(this.data["sky-color"]);
            this.didChange = false;
        }
       // this.waterShader.uniforms.time.value = new Date().getTime();
        this.landShader.envMap = this.generatedCubeRenderTarget.texture;
        this.landShader.needsUpdate = true;
    }
});