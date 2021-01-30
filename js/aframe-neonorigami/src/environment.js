AFRAME.registerComponent('neon-origami-environment', {
    schema: {
        "sky-color": {type: 'color', default: '#87CEEB'}
    },
    init: function () {
        this.didChange = true;
    },
    update: function (oldData) {
        if(oldData["sky-color"] != this.data["sky-color"]){
            this.didChange = true;
        }
    },
    tick: function () {
        if(this.didChange){
            // get the three js scene
            const scene = this.el.closest("a-scene").object3D;
            scene.background = new THREE.Color( this.data["sky-color"] );
            this.didChange = false;
        }
    }
  });