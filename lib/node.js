import {vec3, mat3, mat4, quat} from 'vmath';
import uuid from './uuid';

let v3_a = vec3.create();
let q_a = quat.create();
let m3_a = mat3.create();
let m3_b = mat3.create();
let m4_a = mat4.create();

export default class Node {
  constructor (name) {
    this._id = uuid();
    this._parent = null;
    this._children = [];

    this.name = name || '';
    this.lpos = vec3.new(0,0,0);
    this.lscale = vec3.new(1,1,1);
    this.lrot = quat.new(0,0,0,1);
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
   * @param {Node} newParent
   * @return {boolean}
   */
  setParent (newParent) {
    let oldParent = this._parent;

    // newParent is the current parent of this
    if (oldParent === newParent) {
      return false;
    }

    // make sure the newParent is not a child of this
    let cur = newParent;
    while (cur) {
      if (cur === this) {
        // console.warn(`Failed to set parent for ${this.name}: the new parent ${newParent.name} is its child.`);
        return false;
      }

      cur = cur._parent;
    }

    // remove this from its old parent (if it has)
    if (oldParent) {
      let len = oldParent._children.length;
      for (let i = 0; i < len; ++i) {
        if (oldParent._children[i] === this) {
          oldParent._children.splice(i, 1);
          break;
        }
      }
    }

    // append it to the new parent
    this._parent = newParent;
    if (newParent) {
      newParent._children.push(this);
    }

    return true;
  }

  /**
   * @method insertAt
   * @param {Node} node
   * @param {number} idx
   *
   * Insert `node` before the `idx` of children.
   */
  insertAt (idx, node) {
    if (!node) {
      return false;
    }

    // make sure the node is not the parent of this
    let cur = this;
    while (cur) {
      if (cur === node) {
        // console.warn(`Failed to append ${node.name}: it is the ancient of current node.`);
        return false;
      }

      cur = cur._parent;
    }

    let oldParent = node._parent;

    // 0 <= idx <= len
    let len = this._children.length;
    idx = idx < 0 ? 0 : idx > len ? len : idx;

    // remove node from its current parent
    if (oldParent) {
      len = oldParent._children.length;
      for (let i = 0; i < len; ++i) {
        if (oldParent._children[i] === node) {
          // if we already have the child
          if (oldParent === this) {
            // if its insert position didn't changed, don't do anything.
            if (i === idx || i === idx - 1) {
              return false;
            }

            if (i < idx - 1) {
              idx = idx - 1;
            }
          }

          oldParent._children.splice(i, 1);
          break;
        }
      }
    }

    // append the new node
    node._parent = this;
    this._children.splice(idx, 0, node);

    return true;
  }

  /**
   * @method append
   * @param {Node} node
   * @return {boolean}
   *
   * Append `node` at the end of children.
   */
  append (node) {
    if (!node) {
      return false;
    }

    // make sure the node is not the parent of this
    let cur = this;
    while (cur) {
      if (cur === node) {
        // console.warn(`Failed to append ${node.name}: it is the ancient of current node.`);
        return false;
      }

      cur = cur._parent;
    }

    let oldParent = node._parent;

    // remove node from its current parent
    if (oldParent) {
      let len = oldParent._children.length;
      for (let i = 0; i < len; ++i) {
        if (oldParent._children[i] === node) {
          // if we already have the child and its insert position didn't changed, don't do anything.
          if (oldParent === this && i === len-1) {
            return false;
          }

          oldParent._children.splice(i, 1);
          break;
        }
      }
    }

    // append the new node
    node._parent = this;
    this._children.push(node);

    return true;
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
        node._parent = null;

        return true;
      }
    }

    // console.warn(`Failed to remove node ${node.name}, can not find it.`);
    return false;
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
      vec3.mul(out, out, cur.lscale);

      // out = parent_lrot * out
      mat3.fromQuat(m3_a, cur.lrot);
      vec3.transformMat3(out, out, m3_a);

      // out = out + lpos
      vec3.add(out, out, cur.lpos);

      cur = cur._parent;
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
   * @method getWorldRot
   * @param {quat} out
   * @return {quat}
   *
   * Calculate and return world rotation
   */
  getWorldRot (out) {
    quat.copy(out, this.lrot);

    // result = ... * parent.parent.lrot * parent.lrot * lrot
    let cur = this._parent;
    while (cur) {
      quat.mul(out, cur.lrot, out);

      cur = cur._parent;
    }

    return out;
  }

  /**
   * @method setWorldRot
   * @param {quat} rot
   *
   * Set world position
   */
  setWorldRot (rot) {
    // lrot = rot * inv(prarent.wrot);
    if (this._parent) {
      this._parent.getWorldRot(this.lrot);
      quat.conjugate(this.lrot, this.lrot);
      quat.mul(this.lrot, this.lrot, rot);

      return;
    }

    quat.copy(this.lrot, rot);
  }

  /**
   * @method getWorldScale
   * @param {quat} out
   * @return {quat}
   *
   * Calculate and return world rotation
   */
  getWorldScale (out) {
    // invRot = inv(world_rot)
    this.getWorldRot(q_a);
    quat.conjugate(q_a, q_a);
    mat3.fromQuat(out, q_a);

    // worldRotScale
    this._getWorldRS(m3_a);

    // invRot * worldRotScale
    mat3.mul(out, out, m3_a);

    return out;
  }

  /**
   * @method invTransformPoint
   * @param {vec3} out
   * @param {vec3} vec3
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
    quat.conjugate(q_a, this.lrot);
    mat3.fromQuat(m3_a, q_a);
    vec3.transformMat3(out, out, m3_a);

    // out = (1/scale) * out
    vec3.inverseSafe(v3_a, this.lscale);
    vec3.mul(out, out, v3_a);

    return out;
  }

  /**
   * @method getLocalMatrix
   * @param {mat4} out
   * @return {mat4}
   *
   * Calculate and return local transform
   */
  getLocalMatrix (out) {
    mat4.fromRTS(out, this.lrot, this.lpos, this.lscale);
    return out;
  }

  /**
   * @method getWorldMatrix
   * @param {mat4} out
   * @return {mat4}
   *
   * Calculate and return world transform
   */
  getWorldMatrix (out) {
    // out = ... * parent.parent.local * parent.local * local;
    this.getLocalMatrix(out);

    let cur = this._parent;
    while (cur) {
      cur.getLocalMatrix(m4_a);
      mat4.mul(out, m4_a, out);

      cur = cur._parent;
    }

    return out;
  }

  /**
   * @method getWorldRT
   * @param {mat4} out
   * @return {mat4}
   *
   * Calculate and return world transform without scale
   */
  _getWorldRT (out) {
    this._getWorldPosAndRot(v3_a, q_a);
    mat4.fromRT(out, q_a, v3_a);

    return out;
  }

  /**
   * @method _getWorldRS
   * @param {mat3} out
   *
   * Calculate and return world rotation and scale matrix
   */
  _getWorldRS (out) {
    mat3.set(m3_a,
      this.lscale.x, 0, 0,
      0, this.lscale.y, 0,
      0, 0, this.lscale.z
    );
    mat3.fromQuat(m3_b, this.lrot);

    if (this._parent) {
      // parent_RS * rot * scale
      this._parent._getWorldRS(out);
      mat3.mul(out, out, m3_b);
      mat3.mul(out, out, m3_a);
    } else {
      // rot * scale
      mat3.mul(out, m3_b, m3_a);
    }

    return out;
  }

  /**
   * @method _getWorldPosAndRot
   * @param {vec3} opos
   * @param {vec3} orot
   *
   * Calculate and return world position
   */
  _getWorldPosAndRot (opos, orot) {
    vec3.copy(opos, this.lpos);
    quat.copy(orot, this.lrot);

    let cur = this._parent;
    while (cur) {
      // opos = parent_lscale * lpos
      vec3.mul(opos, opos, cur.lscale);

      // opos = parent_lrot * opos
      mat3.fromQuat(m3_a, cur.lrot);
      vec3.transformMat3(opos, opos, m3_a);

      // opos = opos + lpos
      vec3.add(opos, opos, cur.lpos);

      // orot = lrot * orot
      quat.mul(orot, cur.lrot, orot);

      cur = cur._parent;
    }
  }
}