import { ProceduralTerrain } from "./terrain"

function heightMapGrid(pointWidth, heightCalc, vertexColorCalc) {
    const geometry = new THREE.Geometry();
    const unit = 5;
    for (let y = 0; y < pointWidth; y++) {
        for (let x = 0; x < pointWidth; x++) {
            let px = -pointWidth * unit / 2 + x * unit;
            let py = -pointWidth * unit / 2 + y * unit;
            geometry.vertices.push(
                new THREE.Vector3(px, heightCalc(x, y), py),
            );
        }
    }

    geometry.faceVertexUvs[1] = [];
    for (let y = 0; y < pointWidth - 1; y++) {
        for (let x = 0; x < pointWidth - 1; x++) {
            let curPoint = y * pointWidth + x
            const top = new THREE.Face3(curPoint, curPoint + pointWidth, curPoint + 1);
            const bot = new THREE.Face3(curPoint + 1, curPoint + pointWidth, curPoint + pointWidth + 1)
            geometry.faces.push(
                top,
                bot,
            );
            geometry.faceVertexUvs[0].push(
                [new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 0)],
                [new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)],
            );
            let dx = 1 / (pointWidth - 1)
            let dy = 1 / (pointWidth - 1)
            geometry.faceVertexUvs[1].push(
                [new THREE.Vector2(x * dx, y * dy), new THREE.Vector2(x * dx, y * dy + dy), new THREE.Vector2(x * dx + dx, y * dy)],
                [new THREE.Vector2(x * dx + dx, y * dy), new THREE.Vector2(x * dx, y * dy + dy), new THREE.Vector2(x * dx + dx, y * dy + dy)],
            );
            if (vertexColorCalc) {
                top.vertexColors.push(
                    vertexColorCalc(x, y),
                    vertexColorCalc(x, y + 1),
                    vertexColorCalc(x + 1, y),
                )
                bot.vertexColors.push(
                    vertexColorCalc(x + 1, y),
                    vertexColorCalc(x, y + 1),
                    vertexColorCalc(x + 1, y + 1),
                )
            }
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    return geometry;
}

function infiniteWrap(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export class Land {
    constructor(private parent, private colliderGroup) {
        // points width and height centered around 0,0
        const pointWidth = 40;

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

        /* this.landShader = new THREE.MeshStandardMaterial({
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
                }*/

        const desertShader = new THREE.MeshStandardMaterial({
            map: infiniteWrap(loader.load('Ground027_2K_Color.jpg')),
            normalMap: infiniteWrap(loader.load('Ground027_2K_Normal.jpg')),
            roughness: 1.3,
            aoMap: infiniteWrap(loader.load('Ground027_2K_AmbientOcclusion.jpg')),
            roughnessMap: infiniteWrap(loader.load('Ground027_2K_Roughness.jpg')),
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
            let taperDist = 10;
            let taper = Math.max(-0.11, taperDist - distanceFromCenter) / taperDist

            let nearTaper = distanceFromCenter < 10 ? distanceFromCenter / 10 : 1
            // let's make sure the area around map position 0,0 isn't too crazy
            // further from center of map allows for more variation of height scale
            let scale = distanceFromCenter * 8;
            // lets center our height scale around zero so we have some above and below water
            let height = heightFromNoise * scale * taper * nearTaper;
            return height;
        }, (x: number, y: number) => {
            return new THREE.Color(color[y * pointWidth + x], color[y * pointWidth + x], color[y * pointWidth + x])
        });
        /*  const top = new THREE.Mesh(geo, this.landShader);
          top.position.y = .01;
          this.parent.add(top);*/

        // we attach ONLY base to collider group to reduce raycasting logic
        const bottom = new THREE.Mesh(geo, desertShader)
        this.colliderGroup.add(bottom);

        // Sea basin
        const w = 100;
        const h = 100;
        const geometry = new THREE.PlaneGeometry(w * 5, h * 5, 1, 1);

        const uvs = geometry.faceVertexUvs[0];
        uvs[0][0].set(0, h);
        uvs[0][1].set(0, 0);
        uvs[0][2].set(w, h);
        uvs[1][0].set(0, 0);
        uvs[1][1].set(w, 0);
        uvs[1][2].set(w, h);
        const mesh = new THREE.Mesh(geometry, desertShader);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -.1;
        this.parent.add(mesh);
    }
}