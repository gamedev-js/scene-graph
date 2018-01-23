'use strict';

const buble = require('rollup-plugin-buble');
const fsJetpack = require('fs-jetpack');
const pjson = require('../package.json');

let banner = `
/*
 * ${pjson.name} v${pjson.version}
 * (c) ${new Date().getFullYear()} @gamedev-js
 * Released under the MIT License.
 */
`;

let dest = './dist';
let file = 'scene-graph';
let name = 'sgraph';
let sourcemap = true;
let globals = { 'vmath': 'window.vmath' };

// clear directory
fsJetpack.dir(dest, { empty: true });

module.exports = {
  input: './index.js',
  external: ['vmath'],
  plugins: [
    buble(),
  ],
  output: [
    {
      file: `${dest}/${file}.dev.js`,
      format: 'iife',
      name,
      banner,
      globals,
      sourcemap
    },
    {
      file: `${dest}/${file}.js`,
      format: 'cjs',
      name,
      banner,
      globals,
      sourcemap
    },
  ],
};