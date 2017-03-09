import {vec3, mat3, quat} from 'gl-matrix';
import uuid from './uuid';

let v3_a = vec3.create();
let m3_a = mat3.create();
let q_a = quat.create();

export default class Node {
  constructor (name) {
    this._id = uuid();
    this._parent = null;
    this._children = [];

    this.name = name || '';
    this.lpos = vec3.create();
    this.lscale = vec3.create();
    this.lrot = quat.create();
  }

  /**
   * @property {number} id
   */
  get id () {
    return this._id;
  }

  /**
   * @property parent
   *
   * get parent
   */
  get parent () {
    return this._parent;
  }

  /**
   * @property children
   *
   * get children
   */
  get children () {
    return this._children;
  }

  // ===============================
  // hierarchy
  // ===============================

  /**
   * @method setParent
   */
  setParent (p, idx) {
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

  /**
   * @method remove
   *
   * Remove self from parent
   */
  remove () {
    if (this._parent) {
      this._parent.removeChild(this);
    }
  }

  /**
   * @method removeChild
   * @param {Node} node
   *
   * Remove child
   */
  removeChild (node) {
    let len = this._children.length;

    for (let i = 0; i < len; ++i ) {
      if (this._children[i] === node) {
        this._children.splice(i,1);
        node.setParent(null);

        return;
      }
    }

    console.warn(`Failed to remove node ${node.name}, can not find it.`);
  }

  // ===============================
  // transform
  // ===============================

  /**
   * @method getWorldPos
   * @param {vec3} out
   * @return {vec3}
   *
   * Calculate and return world position
   */
  getWorldPos (out) {
    vec3.copy(out, this.lpos);

    let cur = this._parent;
    while (cur) {
      // out = parent_lscale * lpos
      vec3.mul(out, cur.lscale);

      // out = parent_lrot * out
      mat3.fromQuat(m3_a, cur.lrot);
      vec3.transformMat3(out, out, m3_a);

      // out = out + lpos
      vec3.add(out, cur.lpos);

      cur = cur.parent;
    }

    return out;
  }

  /**
   * @method setWorldPos
   * @param {vec3} pos
   *
   * Set world position
   */
  setWorldPos (pos) {
    // NOTE: this is faster than invert world matrix and transform the point

    if (this._parent) {
      this._parent.invTransformPoint(this.lpos, pos);
      return;
    }

    vec3.copy(this.lpos, pos);
  }

  /**
   * @method invTransformPoint
   *
   * Transforms position from world space to local space.
   */
  invTransformPoint (out, pos) {
    if (this._parent) {
      this._parent.invTransformPoint(out, pos);
    } else {
      vec3.copy(out, pos);
    }

    // out = parent_inv_pos - lpos
    vec3.sub(out, out, this.lpos);

    // out = inv(lrot) * out
    quat.invert(q_a, this.lrot);
    mat3.fromQuat(m3_a, q_a);
    vec3.transformMat3(out, out, m3_a);

    // out = (1/scale) * out
    vec3.inverseSafe(v3_a, this.lscale);
    vec3.mul(out, out, v3_a);

    return out;
  }
}