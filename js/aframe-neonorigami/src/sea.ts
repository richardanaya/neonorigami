import {heightMapGrid} from "./geometry"

export class Sea {
    private waterShader;
    constructor(private scene, pointWidth){
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
        this.scene.add(new THREE.Mesh(heightMapGrid(pointWidth, () => 0), this.waterShader));
     }

    public update(){
        this.waterShader.needsUpdate = true;
    }
}