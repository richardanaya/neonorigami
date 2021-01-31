
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
  'use strict';

  var generatePerlinNoise_1 = generatePerlinNoise;

  function generatePerlinNoise(width, height, options) {
    options = options || {};
    var octaveCount = options.octaveCount || 4;
    var amplitude = options.amplitude || 0.1;
    var persistence = options.persistence || 0.2;
    var whiteNoise = generateWhiteNoise(width, height);

    var smoothNoiseList = new Array(octaveCount);
    var i;
    for (i = 0; i < octaveCount; ++i) {
      smoothNoiseList[i] = generateSmoothNoise(i);
    }
    var perlinNoise = new Array(width * height);
    var totalAmplitude = 0;
    // blend noise together
    for (i = octaveCount - 1; i >= 0; --i) {
      amplitude *= persistence;
      totalAmplitude += amplitude;

      for (var j = 0; j < perlinNoise.length; ++j) {
        perlinNoise[j] = perlinNoise[j] || 0;
        perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
      }
    }
    // normalization
    for (i = 0; i < perlinNoise.length; ++i) {
        perlinNoise[i] /= totalAmplitude;
    }

    return perlinNoise;

    function generateSmoothNoise(octave) {
      var noise = new Array(width * height);
      var samplePeriod = Math.pow(2, octave);
      var sampleFrequency = 1 / samplePeriod;
      var noiseIndex = 0;
      for (var y = 0; y < height; ++y) {
        var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
        var sampleY1 = (sampleY0 + samplePeriod) % height;
        var vertBlend = (y - sampleY0) * sampleFrequency;
        for (var x = 0; x < width; ++x) {
          var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
          var sampleX1 = (sampleX0 + samplePeriod) % width;
          var horizBlend = (x - sampleX0) * sampleFrequency;

          // blend top two corners
          var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * width + sampleX0], vertBlend);
          // blend bottom two corners
          var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * width + sampleX1], vertBlend);
          // final blend
          noise[noiseIndex] = interpolate(top, bottom, horizBlend);
          noiseIndex += 1;
        }
      }
      return noise;
    }
  }
  function generateWhiteNoise(width, height) {
    var noise = new Array(width * height);
    for (var i = 0; i < noise.length; ++i) {
      noise[i] = Math.random();
    }
    return noise;
  }
  function interpolate(x0, x1, alpha) {
    return x0 * (1 - alpha) + alpha * x1;
  }

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
              let curPoint = y * pointWidth + x;
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
              const scene = this.el.closest("a-scene").object3D;
              scene.background = new THREE.Color(this.data["sky-color"]);
              this.didChange = false;
              const noise = generatePerlinNoise_1(201, 201);
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

}());
