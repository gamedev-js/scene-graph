
/*
 * scene-graph v1.0.1
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

(function (exports,vmath) {
'use strict';

// REFERENCE: https://gist.github.com/jed/982883

function b(a) {
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a / 4       // 8 to 11
    ).toString(16)   // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
    ).replace(       // replacing
      /[018]/g,      // zeroes, ones, and eights with
      b              // random hex digits
      );
}

let v3_a = vmath.vec3.create();
let m3_a = vmath.mat3.create();
let m3_b = vmath.mat3.create();
let q_a = vmath.quat.create();

class Node {
  constructor (name) {
    this._id = b();
    this._parent = null;
    this._children = [];

    this.name = name || '';
    this.lpos = vmath.vec3.new(0,0,0);
    this.lscale = vmath.vec3.new(1,1,1);
    this.lrot = vmath.quat.new(0,0,0,1);
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
    vmath.vec3.copy(out, this.lpos);

    let cur = this._parent;
    while (cur) {
      // out = parent_lscale * lpos
      vmath.vec3.mul(out, out, cur.lscale);

      // out = parent_lrot * out
      vmath.mat3.fromQuat(m3_a, cur.lrot);
      vmath.vec3.transformMat3(out, out, m3_a);

      // out = out + lpos
      vmath.vec3.add(out, cur.lpos);

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

    vmath.vec3.copy(this.lpos, pos);
  }

  /**
   * @method getWorldRot
   * @param {quat} out
   * @return {quat}
   *
   * Calculate and return world rotation
   */
  getWorldRot (out) {
    vmath.vec3.copy(out, this.lrot);

    // result = lrot * parent.lrot * parent.parent.lrot * ...
    let cur = this._parent;
    while (cur) {
      vmath.quat.mul(out, out, cur.lrot);

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
    // lrot = inv(parent.lrot) * rot;
    if (this._parent) {
      this._parent.getWorldRot(this.lrot);
      vmath.quat.invert(this.lrot);
      vmath.quat.mul(this.lrot, this.lrot, rot);

      return;
    }

    vmath.quat.copy(this.lrot, rot);
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
    vmath.quat.invert(q_a, q_a);
    vmath.mat3.fromQuat(out, q_a);

    // worldRotScale
    this._getWorldRS(m3_a);

    // invRot * worldRotScale
    vmath.mat3.mul(out, out, m3_a);

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
      vmath.vec3.copy(out, pos);
    }

    // out = parent_inv_pos - lpos
    vmath.vec3.sub(out, out, this.lpos);

    // out = inv(lrot) * out
    vmath.quat.invert(q_a, this.lrot);
    vmath.mat3.fromQuat(m3_a, q_a);
    vmath.vec3.transformMat3(out, out, m3_a);

    // out = (1/scale) * out
    vmath.vec3.inverseSafe(v3_a, this.lscale);
    vmath.vec3.mul(out, out, v3_a);

    return out;
  }

  /**
   * @method _getWorldRS
   * @param {mat3} out
   *
   * Calculate and return world rotation and scale matrix
   */
  _getWorldRS (out) {
    vmath.mat3.set(m3_a,
      this.lscale.x, 0, 0,
      0, this.lscale.y, 0,
      0, 0, this.lscale.z
    );
    vmath.mat3.fromQuat(m3_b, this.lrot);

    if (this._parent) {
      // parent_RS * rot * scale
      this._parent._getWorldRS(out);
      vmath.mat3.mul(out, out, m3_b);
      vmath.mat3.mul(out, out, m3_a);
    } else {
      // rot * scale
      vmath.mat3.mul(out, m3_b, m3_a);
    }

    return out;
  }
}

exports.Node = Node;

}((this.sg = this.sg || {}),window));
//# sourceMappingURL=sg.dev.js.map
