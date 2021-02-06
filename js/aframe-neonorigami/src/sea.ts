import { heightMapGrid } from "./geometry"

export class Sea {
    private waterShader;
    constructor(private parent) {
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

        const w = 5000;
        const h = 5000;
        const geometry = new THREE.PlaneGeometry(w, h, 1, 1);

        const uvs = geometry.attributes.uv.array;
        uvs[1] = h;
        uvs[2] = w;
        uvs[3] = h;
        uvs[3] = w;
        const mesh = new THREE.Mesh(geometry, this.waterShader);
        mesh.rotation.x = -Math.PI / 2;
        //this.parent.add(mesh);
    }
}