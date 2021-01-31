export class Sky {
    private skyShader;
    constructor(private scene, pointWidth) {
        this.skyShader = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,

            uniforms: {
                // The time in milliseconds since unix epoch
                time: { value: new Date().getTime() },
            },

            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                    vWorldPosition = worldPosition.xyz;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
                            
            `,

            fragmentShader: `
                varying vec3 vWorldPosition;
                const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );
                void main() {
                    // ocean blue
                    vec3 direction = normalize( vWorldPosition - cameraPos );
                    gl_FragColor = vec4(.52, .8, .92,1.0)*(1.0-direction.y);
                }
            `
        })

        this.scene.add(new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), this.skyShader));
    }
}