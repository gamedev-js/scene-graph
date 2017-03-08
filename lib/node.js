import {vec3, quat} from 'gl-matrix';
import uuid from './uuid';

export default class Node {
  constructor () {
    this._id = uuid();
    this._parent = null;
    this._children = [];

    this.name = '';
    this.localPosition = vec3.create();
    this.localScale = vec3.create();
    this.localRotation = quat.create();
  }

  /**
   * @property {number} id
   */
  get id () {
    return this._id;
  }

  /**
   * @property {Node} parent
   */
  get parent () {
    return this._parent;
  }
  set parent (p) {
    // TODO
  }

  /**
   * @method insertAt
   * @param {Node} node
   * @param {number} idx
   *
   * Insert `node` before the `idx` of children.
   */
  insertAt (node, idx) {
    // TODO
  }

  /**
   * @method append
   * @param {Node} node
   *
   * Append `node` at the end of children.
   */
  append (node) {
    // TODO
  }
}