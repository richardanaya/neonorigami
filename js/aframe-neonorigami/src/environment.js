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
        renderer.physicallyCorrectLights = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.shadowMapEnabled = true;
        this.scene = this.el.closest("a-scene").object3D;

        // 100 points width and height centered around 0,0
        const pointWidth = 200;

        this.lighting = new Lighting(renderer, this.scene);
        this.sky = new Sky(this.scene);
        this.land = new Land(this.scene, pointWidth);
        this.sea = new Sea(this.scene, pointWidth);
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

        this.sky.update();
        this.land.update();
        this.sea.update();
    }
});