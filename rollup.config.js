import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'js/main.js',
  output: {
    file: 'neonorigami.js',
    format: 'iife',
    name: 'NeonOrigami'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
