import { vec3, quat } from 'vmath';
import Node from './node';

/**
 * @method walk
 * @param {Node} node
 * @param {function} fn
 * @param {Node} fn.node
 * @param {Node} fn.parent
 */
function walk(node, fn) {
  node.children.forEach(function (child) {
    let continueWalk = fn(child, node);

    if (continueWalk !== false) {
      walk(child, fn);
    }
  });
}

/**
 * @method flat
 * @param {Node} node
 */
function flat(node) {
  let out = [];

  out.push(node);
  walk(node, function (iter) {
    out.push(iter);
  });

  return out;
}

/**
 * @method replace
 * @param {Node} oldNode
 * @param {Node} newNode
 */
function replace(oldNode, newNode) {
  newNode.remove();

  let parent = oldNode._parent;
  if (!parent) {
    return;
  }

  oldNode._parent = null;
  newNode._parent = parent;

  let len = parent._children.length;
  for (let i = 0; i < len; ++i) {
    if (parent._children[i] === oldNode) {
      parent._children[i] = newNode;
      return;
    }
  }
}

/**
 * @method enable
 * @param {Node} node
 * @param {boolean} val
 * @param {function} fn
 */
function enable(node, val, fn) {
  if (node._enabled !== val) {
    node._enabled = val;

    if (fn) {
      fn(node, val);

      walk(node, function (n) {
        if (n._enabled) {
          fn(n, val);
          return true;
        }

        return false;
      });
    }
  }
}

/**
 * @method clone
 * @param {Node} node
 * @param {function} fn
 * @return {Node}
 */
function clone(node, fn) {
  let newNode = new Node();
  newNode.name = node.name;
  vec3.copy(newNode.lpos, node.lpos);
  vec3.copy(newNode.lscale, node.lscale);
  quat.copy(newNode.lrot, node.lrot);

  // do user custom clone function
  if (fn) {
    fn(newNode, node);
  }

  return newNode;
}

/**
 * @method deepClone
 * @param {Node} node
 * @param {function} fn
 * @return {Node}
 */
function deepClone(node, fn) {
  let newNode = clone(node, fn);

  newNode._children = new Array(node._children.length);
  for (let i = 0; i < node._children.length; ++i) {
    let child = node._children[i];
    let newChild = deepClone(child, fn);
    newNode._children[i] = newChild;
    newChild._parent = newNode;
  }

  return newNode;
}

/**
 * @method enabledInHierarchy
 * @param {Node} node
 */
function enabledInHierarchy(node) {
  if (!node._enabled) {
    return false;
  }

  let cur = node._parent;
  while (cur) {
    if (!cur._enabled) {
      return false;
    }

    cur = cur._parent;
  }

  return true;
}

let utils = {
  walk,
  flat,
  replace,
  enable,
  clone,
  deepClone,
  enabledInHierarchy,
};
export default utils;