
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
  'use strict';

  AFRAME.registerComponent('neon-origami-landscape', {
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
      },
      remove: function () {},
      pause: function () {},
      play: function () {}
    });

}());
