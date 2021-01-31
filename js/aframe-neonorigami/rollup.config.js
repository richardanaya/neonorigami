import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/main.js',
  output: [{
    file: 'dist/aframe-neonorigami.js',
    format: 'iife',
    name: 'AFrameNeonOrigami'
  },{
    file: 'aframe-neonorigami.js',
    format: 'iife',
    name: 'AFrameNeonOrigami'
  }],
  plugins: [
    typescript(),
    resolve(),
    commonjs(),
  ]
};
