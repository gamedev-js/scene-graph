import {vec3, mat3, quat} from 'gl-matrix';
import uuid from './uuid';

let v3_a = vec3.create();
let m3_a = mat3.create();

export default class Node {
  constructor (name) {
    this._id = uuid();
    this._parent = null;
    this._children = [];

    this.name = name || '';
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
   * @property {vec3} position
   *
   * World position
   */
  get position () {
    vec3.copy(v3_a, this.localPosition);

    let cur = this.parent;
    while (cur) {
      vec3.mul(v3_a, cur.localScale);
      mat3.fromQuat(m3_a, cur.localRotation);
      vec3.transformMat3(v3_a, v3_a, m3_a);
      vec3.add(v3_a, cur.localPosition);

      cur = cur.parent;
    }

    return vec3.clone(v3_a);
  }
  set position (v) {
    // TODO:
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

  /**
   * @method sync
   *
   * Sync transform
   */
  sync () {
    // TODO
  }
}