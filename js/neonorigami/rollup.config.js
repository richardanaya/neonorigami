import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/main.js',
  output: [{
    file: 'dist/neonorigami.js',
    format: 'iife',
    name: 'NeonOrigami'
  },{
    file: 'neonorigami.js',
    format: 'iife',
    name: 'NeonOrigami'
  }],
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};
