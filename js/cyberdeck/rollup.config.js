import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/cyberdeck.js',
    format: 'iife',
    name: 'CyberDeck'
  },{
    file: 'cyberdeck.js',
    format: 'iife',
    name: 'CyberDeck'
  }],
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};
