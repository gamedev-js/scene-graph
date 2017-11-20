import { vec3, quat } from 'vmath';
import Node from './node';

/**
 * @method walk
 * @param {Node} node
 * @param {function} fn
 * @param {Node} fn.node
 * @param {Node} fn.parent
 * @param {number} fn.level
 */
function walk(node, fn, level = 0) {
  level += 1;
  let len = node.children.length;

  for (let i = 0; i < len; ++i) {
    let child = node.children[i];
    let continueWalk = fn(child, node, level);

    if (continueWalk !== false) {
      walk(child, fn, level);
    }
  }
}

/**
 * @method walk2
 * @param {Node} node
 * @param {function} fn1
 * @param {Node} fn1.node
 * @param {Node} fn1.parent
 * @param {number} fn1.level
 *
 * fn1 is used when entering the node
 *
 * @param {function} fn2
 * @param {Node} fn2.node
 * @param {Node} fn2.parent
 * @param {number} fn2.level
 *
 * fn2 is used when leaving the node
 */
function walk2(node, fn1, fn2, level = 0) {
  level += 1;
  let len = node.children.length;

  for (let i = 0; i < len; ++i) {
    let child = node.children[i];
    let continueWalk = fn1(child, node, level);

    if (continueWalk !== false) {
      walk2(child, fn1, fn2, level);
    }
    fn2(child, node, level);
  }
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
 * @param {function} ctor
 * @param {function} fn
 * @return {Node}
 */
function clone(node, ctor = Node, fn = null) {
  let newNode = new ctor();
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
 * @param {function} ctor
 * @param {function} fn
 * @return {Node}
 */
function deepClone(node, ctor = Node, fn = null) {
  let newNode = clone(node, ctor, fn);

  newNode._children = new Array(node._children.length);
  for (let i = 0; i < node._children.length; ++i) {
    let child = node._children[i];
    let newChild = deepClone(child, ctor, fn);
    newNode._children[i] = newChild;
    newChild._parent = newNode;
  }

  return newNode;
}

/**
 * @method enabledInHierarchy
 * @param {Node} node
 * @param {boolean} includeSelf
 */
function enabledInHierarchy(node, includeSelf = true) {
  if (includeSelf && !node._enabled) {
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

/**
 * @method find
 * @param {Node} root
 * @param {string} path
 */
function find(root, path) {
  let names = path.split('/');

  function _recurse(node, level) {
    let len = node.children.length;
    let name = names[level];

    for (let i = 0; i < len; ++i) {
      let child = node.children[i];

      if (child.name !== name) {
        continue;
      }

      if (level === names.length - 1) {
        return child;
      } else {
        return _recurse(child, level + 1);
      }
    }

    return null;
  }

  return _recurse(root, 0);
}

let utils = {
  walk,
  walk2,
  flat,
  replace,
  enable,
  clone,
  deepClone,
  enabledInHierarchy,
  find,
};
export default utils;