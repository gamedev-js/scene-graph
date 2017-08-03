const tap = require('tap');
const { vec3, quat } = require('vmath');
const { Node } = require('../dist/scene-graph');

tap.test('node', t => {
  t.test('constructor', t => {
    let n0 = new Node();
    t.equal(n0.name, '');
    t.assert(vec3.equals(n0.lpos, vec3.new(0,0,0)));
    t.assert(vec3.equals(n0.lrot, quat.new(0,0,0,1)));
    t.assert(vec3.equals(n0.lscale, vec3.new(1,1,1)));

    let n1 = new Node('foobar');
    t.equal(n1.name, 'foobar');
    t.assert(vec3.equals(n1.lpos, vec3.new(0,0,0)));
    t.assert(vec3.equals(n1.lrot, quat.new(0,0,0,1)));
    t.assert(vec3.equals(n1.lscale, vec3.new(1,1,1)));

    t.end();
  });

  t.test('mixin', t => {
    class Foo {
      constructor() {
        this.foo = 'foo';
        this.bar = 'bar';
        this.__initNode();
      }
    }
    Node.mixin(Foo);

    let foo1 = new Foo();
    let foo2 = new Foo();
    foo1.append(foo2);

    t.equal(foo1.name, '');
    t.assert(vec3.equals(foo1.lpos, vec3.new(0,0,0)));
    t.assert(vec3.equals(foo1.lrot, quat.new(0,0,0,1)));
    t.assert(vec3.equals(foo1.lscale, vec3.new(1,1,1)));
    t.equal(foo2.parent, foo1);

    t.end();
  });

  t.test('enable', t => {
    let root = new Node('root');
    let n0 = new Node('n0');
    let n1 = new Node('n1');
    let n2 = new Node('n2');
    let n11 = new Node('n11');
    let n22 = new Node('n22');

    n0.setParent(root);
    n1.setParent(n0);
    n11.setParent(n0);
    n2.setParent(n1);
    n22.setParent(n11);

    let n0_walked = false;
    let n1_walked = false;
    let n2_walked = false;
    let n11_walked = false;
    let n22_walked = false;

    n11._enabled = false;

    n0.enable(false, node => {
      if (node === n0) {
        n0_walked = true;
      } else if (node === n1) {
        n1_walked = true;
      } else if (node === n2) {
        n2_walked = true;
      } else if (node === n11) {
        n11_walked = true;
      } else if (node === n22) {
        n22_walked = true;
      }
    });

    t.equal(n0_walked, true);
    t.equal(n1_walked, true);
    t.equal(n2_walked, true);
    t.equal(n11_walked, false);
    t.equal(n22_walked, false);

    t.end();
  });

  t.test('clone', t => {
    let root = new Node('root');
    let n0 = new Node('n0');
    let n1 = new Node('n1');
    let n2 = new Node('n2');

    n0.setParent(root);
    n1.setParent(n0);
    n2.setParent(n1);

    vec3.set(n0.lpos, 1,2,3);
    vec3.set(n0.lscale, 2,2,2);

    let n0_2 = n0.clone();
    t.equal(n0_2.name, 'n0');
    t.assert(vec3.equals(n0_2.lpos, vec3.new(1,2,3)));
    t.assert(vec3.equals(n0_2.lrot, quat.new(0,0,0,1)));
    t.assert(vec3.equals(n0_2.lscale, vec3.new(2,2,2)));
    t.deepEqual(n0_2._children, []);
    t.equal(n0_2._parent, null);

    t.end();
  });

  t.test('deepClone', t => {
    let root = new Node('root');
    let n0 = new Node('n0');
    let n1 = new Node('n1');
    let n2 = new Node('n2');

    n0.setParent(root);
    n1.setParent(n0);
    n2.setParent(n1);

    vec3.set(n0.lpos, 1,2,3);
    vec3.set(n0.lscale, 2,2,2);

    let root2 = root.deepClone();
    t.equal(root2.name, 'root');
    t.equal(root2.children[0].name, 'n0');
    t.notEqual(root2.children[0], n0);
    t.equal(root2.children[0]._parent, root2);

    t.end();
  });

  t.test('setParent', t => {
    let root, n0, n1, n2;

    t.beforeEach(done => {
      root = new Node('root');
      n0 = new Node('n0');
      n1 = new Node('n1');
      n2 = new Node('n2');

      n0.setParent(root);
      n1.setParent(n0);
      n2.setParent(n1);

      done();
    });

    t.test('simple', t => {
      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });


    t.test('simple 2', t => {
      t.assert(n1.setParent(root));
      t.assert(n2.setParent(root));

      t.equal(root._children.length, 3);
      t.equal(root._children[0], n0);
      t.equal(root._children[1], n1);
      t.equal(root._children[2], n2);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 0);

      t.equal(n1._parent, root);
      t.equal(n1._children.length, 0);

      t.equal(n2._parent, root);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('setParent to null', t => {
      // must not reset the parent
      t.assert(n0.setParent(null));

      t.equal(root._parent, null);
      t.equal(root._children.length, 0);

      t.equal(n0._parent, null);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('setParent to same parent', t => {
      // must not reset the parent
      t.assert(n0.setParent(root) === false);
      t.assert(n1.setParent(n0) === false);
      t.assert(n2.setParent(n1) === false);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('setParent to itself', t => {
      // must not set parent on itself
      t.assert(root.setParent(root) === false);
      t.assert(n0.setParent(n0) === false);
      t.assert(n1.setParent(n1) === false);
      t.assert(n2.setParent(n2) === false);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('setParent to its children', t => {
      // must not set parent on its children
      t.assert(n0.setParent(n1) === false);
      t.equal(n0._parent, root);

      t.assert(n0.setParent(n2) === false);
      t.equal(n0._parent, root);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.end();
  });

  t.test('append', t => {
    let root, n0, n1, n2;

    t.beforeEach(done => {
      root = new Node('root');
      n0 = new Node('n0');
      n1 = new Node('n1');
      n2 = new Node('n2');

      root.append(n0);
      n0.append(n1);
      n1.append(n2);

      done();
    });

    t.test('simple', t => {
      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });


    t.test('simple 2', t => {
      t.assert(root.append(n1));
      t.assert(root.append(n2));

      t.equal(root._children.length, 3);
      t.equal(root._children[0], n0);
      t.equal(root._children[1], n1);
      t.equal(root._children[2], n2);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 0);

      t.equal(n1._parent, root);
      t.equal(n1._children.length, 0);

      t.equal(n2._parent, root);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('append to null', t => {
      // must not reset the parent
      t.assert(root.append(null) === false);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('append to same children', t => {
      // must not reset the parent
      t.assert(root.append(n0) === false);
      t.assert(n0.append(n1) === false);
      t.assert(n1.append(n2) === false);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('append to itself', t => {
      // must not set parent on itself
      t.assert(root.append(root) === false);
      t.assert(n0.append(n0) === false);
      t.assert(n1.append(n1) === false);
      t.assert(n2.append(n2) === false);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('append to its parent', t => {
      // must not set parent on its children
      t.assert(n1.append(n0) === false);
      t.equal(n0._parent, root);

      t.assert(n2.append(n0) === false);
      t.equal(n0._parent, root);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.end();
  });

  t.test('insertAt', t => {
    let root, n0, n1, n2;

    t.beforeEach(done => {
      root = new Node('root');
      n0 = new Node('n0');
      n1 = new Node('n1');
      n2 = new Node('n2');

      root.insertAt(0, n0);
      n0.insertAt(0, n1);
      n1.insertAt(0, n2);

      done();
    });

    t.test('simple', t => {
      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });


    t.test('simple 2', t => {
      t.assert(root.insertAt(1, n1));
      t.assert(root.insertAt(2, n2));

      t.equal(root._children.length, 3);
      t.equal(root._children[0], n0);
      t.equal(root._children[1], n1);
      t.equal(root._children[2], n2);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 0);

      t.equal(n1._parent, root);
      t.equal(n1._children.length, 0);

      t.equal(n2._parent, root);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('insertAt to null', t => {
      // must not reset the parent
      t.assert(root.insertAt(0, null) === false);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('insertAt to same children', t => {
      t.assert(root.insertAt(1, n1));
      t.assert(root.insertAt(2, n2));

      // must not reset the parent
      t.assert(root.insertAt(0, n0) === false);
      t.assert(root.insertAt(1, n1) === false);
      t.assert(root.insertAt(2, n2) === false);

      t.equal(root._children.length, 3);
      t.equal(root._children[0], n0);
      t.equal(root._children[1], n1);
      t.equal(root._children[2], n2);

      t.assert(root.insertAt(0, n1));

      t.equal(root._children[0], n1);
      t.equal(root._children[1], n0);
      t.equal(root._children[2], n2);

      t.assert(root.insertAt(3, n1));

      t.equal(root._children[0], n0);
      t.equal(root._children[1], n2);
      t.equal(root._children[2], n1);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 0);

      t.equal(n1._parent, root);
      t.equal(n1._children.length, 0);

      t.equal(n2._parent, root);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('append to itself', t => {
      // must not set parent on itself
      t.assert(root.insertAt(0, root) === false);
      t.assert(n0.insertAt(0, n0) === false);
      t.assert(n1.insertAt(0, n1) === false);
      t.assert(n2.insertAt(0, n2) === false);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.test('append to its parent', t => {
      // must not set parent on its children
      t.assert(n1.insertAt(1, n0) === false);
      t.equal(n0._parent, root);

      t.assert(n2.insertAt(1, n0) === false);
      t.equal(n0._parent, root);

      t.equal(root._parent, null);
      t.equal(root._children.length, 1);
      t.equal(root._children[0], n0);

      t.equal(n0._parent, root);
      t.equal(n0._children.length, 1);
      t.equal(n0._children[0], n1);

      t.equal(n1._parent, n0);
      t.equal(n1._children.length, 1);
      t.equal(n1._children[0], n2);

      t.equal(n2._parent, n1);
      t.equal(n2._children.length, 0);

      t.end();
    });

    t.end();
  });

  t.end();
});