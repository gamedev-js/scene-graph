/**
 * @method walk
 * @param {Node} node
 * @param {function} fn
 * @param {Node} fn.node
 * @param {Node} fn.parent
 */
function walk(node, fn) {
  node.children.forEach(child => {
    fn(child, node);
    walk(child, fn);
  });
}

/**
 * @method flat
 * @param {Node} node
 */
function flat(node) {
  let out = [];

  out.push(node);
  walk(node, iter => {
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

let utils = {
  walk,
  flat,
  replace,
};
export default utils;