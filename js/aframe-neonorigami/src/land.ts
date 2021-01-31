import { ProceduralTerrain } from "./terrain"
import { heightMapGrid } from "./geometry"

export class Land {
    private landShader: any;
    constructor(private scene, pointWidth: number) {
        var map = new ProceduralTerrain({
            height: pointWidth, // Size of map
            width: pointWidth, // Size of map
            details: 20, // Range of values each tile can be
            continent_factor: 2, // Acts as a multiplier on the Simplex results
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

        this.scene.add(new THREE.Mesh(heightMapGrid(pointWidth, (x: number, y: number) => {
            // height from noise, ranged 0.0-1.0
            let heightFromNoise = noise[x][y] / 20;
            // get positions relative to center
            let cx = x - pointWidth / 2;
            let cy = y - pointWidth / 2;
            let distanceFromCenter = Math.sqrt(cx * cx + cy * cy);
            // let's make sure the area around map position 0,0 isn't too crazy
            // further from center of map allows for more variation of height scale
            let scale = distanceFromCenter / 2;
            // lets center our height scale around zero so we have some above and below water
            let height = heightFromNoise * scale - (scale / 2);
            return height;
        }), this.landShader));
    }

    public update(){
        this.landShader.needsUpdate = true;
    }
}