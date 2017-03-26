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

let utils = {
  walk,
  flat,
};
export default utils;