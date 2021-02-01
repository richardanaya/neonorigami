import { Lighting } from "./lighting"
import { Sky } from "./sky"
import { Land } from "./land"
import { Sea } from "./sea"

AFRAME.registerComponent('neon-origami-environment', {
    schema: {
        "sky-color": { type: 'color', default: '#87CEEB' }
    },
    init: function () {
        this.didChange = true;
        
        // get the three js scene
        const renderer = this.el.closest("a-scene").renderer;
        /*renderer.physicallyCorrectLights = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMapEnabled = true;*/
        this.scene = this.el.closest("a-scene").object3D;

        // 100 points width and height centered around 0,0
        const pointWidth = 5;

        let group = new THREE.Group()
        this.lighting = new Lighting(renderer, group);
        this.sky = new Sky(group);
        this.land = new Land(group, pointWidth);
        this.sea = new Sea(group, pointWidth);
        this.el.setObject3D("mesh",group);
    },
    update: function (oldData) {
        if (oldData["sky-color"] != this.data["sky-color"]) {
            this.didChange = true;
        }
    },
    tick: function () {
        if (this.didChange) {
            // get the three js scene
            this.scene.background = new THREE.Color(this.data["sky-color"]);
            this.didChange = false;
        }
    }
});