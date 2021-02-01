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
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        this.scene = this.el.closest("a-scene").object3D;
        this.scene.background = new THREE.Color(0xFFFFFF);

        let colliderGroup = new THREE.Object3D()
        this.lighting = new Lighting(renderer, this.scene);
        this.sky = new Sky(this.scene);
        this.land = new Land(this.scene, colliderGroup);
        this.sea = new Sea(colliderGroup);

        // The arc teleport extension recursively looks at geomtry attached to a-frame element
        this.el.setObject3D("mesh", colliderGroup);

        document.querySelector('a-scene').addEventListener('enter-vr', function () {
            let d = document.createElement("div");
            d.style.position = "absolute";
            d.style.left = -999999999999999999;
            d.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/atMdf0rhbpI?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            document.body.append(d);
        });
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