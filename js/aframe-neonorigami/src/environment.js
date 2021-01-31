import * as perlin from "perlin-noise"

function generateGrid(pointWidth,heightCalc, material) {
    const geometry = new THREE.Geometry();
    for (let y = 0; y < pointWidth; y++) {
        for (let x = 0; x < pointWidth; x++) {
            let px = -pointWidth/2+x;
            let py = -pointWidth/2+y;
            geometry.vertices.push(
                new THREE.Vector3(px, heightCalc(x,y), py),
            );
        }
    }

    for (let y = 0; y < pointWidth-1; y++) {
        for (let x = 0; x < pointWidth-1; x++) {
            let curPoint = y * pointWidth + x
            geometry.faces.push(
                new THREE.Face3(curPoint,  curPoint + pointWidth, curPoint + 1, ),
                new THREE.Face3(curPoint + 1, curPoint + pointWidth, curPoint + pointWidth+1),
            );
        }
    }

    return new THREE.Mesh(geometry, material);
}

AFRAME.registerComponent('neon-origami-environment', {
    schema: {
        "sky-color": { type: 'color', default: '#87CEEB' }
    },
    init: function () {
        this.didChange = true;
        this.waterShader = new THREE.ShaderMaterial({

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
                    gl_FragColor = vec4(0, 0.42, 0.58, 1);
                }
            `
        })
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
            const noise = perlin.generatePerlinNoise(201, 201);
            // land

            const pointWidth = 100;
            scene.add(generateGrid(pointWidth,(x,y) => {
                return Math.max(-.1,noise[y*pointWidth+x]*2-1)
            }, new THREE.MeshBasicMaterial({color: 0x009A17})));
            // water
            scene.add(generateGrid(pointWidth,() => 0, this.waterShader));
        }
        this.waterShader.uniforms.time.value = new Date().getTime();
    }
});