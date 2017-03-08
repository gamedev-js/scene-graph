'use strict';

const version = require('../package.json').version;

let banner = `
/*
 * gamedev-js/scene-graph v${version}
 * (c) ${new Date().getFullYear()} @Johnny Wu
 * Released under the MIT License.
 */
`;

module.exports = {
  entry: './index.js',
  dest: 'dist/sg.js',
  format: 'iife',
  moduleName: 'sg',
  banner: banner,
  external: [
    'gl-matrix'
  ],
  globals: {
    'gl-matrix': 'window'
  },
  sourceMap: true,
};