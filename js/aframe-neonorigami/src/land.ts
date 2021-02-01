import { ProceduralTerrain } from "./terrain"
import { heightMapGrid } from "./geometry"

export class Land {
    private landShader: any;
    private baseShader: any;
    constructor(private scene) {
        // 100 points width and height centered around 0,0
        const pointWidth = 5;

        const details = 200;
        var map = new ProceduralTerrain({
            height: pointWidth, // Size of map
            width: pointWidth, // Size of map
            details: details, // Range of values each tile can be
            continent_factor: 2, // Acts as a multiplier on the Simplex results
        });
        map.generateMaps(1)
        const noise = map.getHeightMap();
        const loader = new THREE.TextureLoader();

        this.landShader = new THREE.MeshStandardMaterial({
            transparent: true,
            map: loader.load('Ground037_2K_Color.jpg'),
            alphaMap: loader.load('terrain.jpg'),
            normalMap: loader.load('Ground037_2K_Normal.jpg'),
            aoMap: loader.load('Ground037_2K_AmbientOcclusion.jpg'),
            roughnessMap: loader.load('Ground037_2K_Roughness.jpg'),
            vertexColors: THREE.VertexColors,
        })

        // hack our material so it uses UV2
        this.landShader.onBeforeCompile = shader => {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <alphamap_fragment>',
                `diffuseColor.a *= texture2D( alphaMap, vUv2 ).g;`
            )
        }

        this.baseShader = new THREE.MeshStandardMaterial({
            map: loader.load('Ground027_2K_Color.jpg'),
            normalMap: loader.load('Ground027_2K_Normal.jpg'),
            aoMap: loader.load('Ground027_2K_AmbientOcclusion.jpg'),
            roughnessMap: loader.load('Ground027_2K_Roughness.jpg'),
            vertexColors: THREE.VertexColors,
        })


        let min = 100000
        let max = -100000;
        let color = [];
        for (let x = 0; x < pointWidth; x++) {
            for (let y = 0; y < pointWidth; y++) {
                min = Math.min(min, noise[x][y]);
                max = Math.max(max, noise[x][y]);
                color[y * pointWidth + x] = Math.random() * .2 + .8;
            }
        }
        const geo = heightMapGrid(pointWidth, (x: number, y: number) => {
            // height from noise, ranged 0.0-1.0
            let heightFromNoise = (noise[x][y] - min) / (max - min);
            // get positions relative to center
            let cx = x - pointWidth / 2;
            let cy = y - pointWidth / 2;
            let distanceFromCenter = Math.sqrt(cx * cx + cy * cy);
            // let's make sure the area around map position 0,0 isn't too crazy
            // further from center of map allows for more variation of height scale
            let scale = distanceFromCenter / 5;
            // lets center our height scale around zero so we have some above and below water
            let height = heightFromNoise * scale - 5;
            return height;
        }, (x: number, y: number) => {
            return new THREE.Color(color[y * pointWidth + x], color[y * pointWidth + x], color[y * pointWidth + x])
        });
        let top = new THREE.Mesh(geo, this.landShader);
        let bottom = new THREE.Mesh(geo, this.baseShader)
        top.position.y = .01;
        this.scene.add(top);
        this.scene.add(bottom);

        //this.scene.add(geo, this.landShader);
    }
}