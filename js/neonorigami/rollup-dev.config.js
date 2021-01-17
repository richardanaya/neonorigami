import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

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
    commonjs(),
    serve({
      contentBase: 'dist',
      port: 8080
    }),
    livereload('dist')
  ]
};
