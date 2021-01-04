import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import path from 'path';

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
    resolve(),
    commonjs(),
    serve('dist'),
    livereload('dist')
  ]
};
