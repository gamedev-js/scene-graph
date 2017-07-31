const tap = require('tap');
const { Node } = require('../dist/scene-graph');

tap.test('node', t => {

  t.test('works with ES6 symbols', t => {
    let e = new Node()
      , symbolCows = Symbol('cows')
      , symbolMoo = Symbol('moo');

    e.on(symbolCows, arg => {
      t.equal(e.listeners(symbolMoo).length, 0);
      t.equal(arg, 'bar');

      e.once(symbolMoo, onced => {
        t.equal(e.listeners(symbolMoo).length, 0);
        t.equal(onced, 'foo');
      });

      t.equal(e.listeners(symbolCows).length, 1);
      t.equal(e.listeners(symbolMoo).length, 1);

      e.off(symbolCows);
      t.equal(e.listeners(symbolCows).length, 0);
      t.equal(e.emit(symbolMoo, 'foo'), true);
    });

    t.equal(e.emit(symbolMoo, 'bar'), false);
    t.equal(e.emit(symbolCows, 'bar'), true);

    t.end();
  });

  t.test('EventEmitter#emit', t => {
    t.test('should return false when there are not events to emit', t => {
      let e = new Node();

      t.equal(e.emit('foo'), false);
      t.equal(e.emit('bar'), false);

      t.end();
    });

    t.test('emits with context', t => {
      let context = { bar: 'baz' }
        , e = new Node();

      e.on('foo', function (bar) {
        t.equal(bar, 'bar');
        t.equal(this, context);

        t.end();
      }, context).emit('foo', 'bar');
    });

    t.test('emits with context, multiple arguments (force apply)', t => {
      let context = { bar: 'baz' }
        , e = new Node();

      e.on('foo', function (bar) {
        t.equal(bar, 'bar');
        t.equal(this, context);

        t.end();
      }, context).emit('foo', 'bar', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0);
    });

    t.test('can emit the function with multiple arguments', t => {
      let e = new Node();

      for (var i = 0; i < 100; i++) {
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j);
          }

          e.once('args', function () {
            t.equal(arguments.length, args.length);
          });

          e.emit.apply(e, ['args'].concat(args));
        })(i);
      }

      t.end();
    });

    t.test('can emit the function with multiple arguments, multiple listeners', t => {
      let e = new Node();

      for (var i = 0; i < 100; i++) {
        (function (j) {
          for (var i = 0, args = []; i < j; i++) {
            args.push(j);
          }

          e.once('args', function () {
            t.equal(arguments.length, args.length);
          });

          e.once('args', function () {
            t.equal(arguments.length, args.length);
          });

          e.once('args', function () {
            t.equal(arguments.length, args.length);
          });

          e.once('args', function () {
            t.equal(arguments.length, args.length);
          });

          e.emit.apply(e, ['args'].concat(args));
        })(i);
      }

      t.end();
    });

    t.test('emits with context, multiple listeners (force loop)', t => {
      let e = new Node();

      e.on('foo', function (bar) {
        t.deepEqual(this, { foo: 'bar' });
        t.equal(bar, 'bar');
      }, { foo: 'bar' });

      e.on('foo', function (bar) {
        t.deepEqual(this, { bar: 'baz' });
        t.equal(bar, 'bar');
      }, { bar: 'baz' });

      e.emit('foo', 'bar');

      t.end();
    });

    t.test('emits with different contexts', t => {
      let e = new Node()
        , pattern = '';

      function writer() {
        pattern += this;
      }

      e.on('write', writer, 'foo');
      e.on('write', writer, 'baz');
      e.once('write', writer, 'bar');
      e.once('write', writer, 'banana');

      e.emit('write');
      t.equal(pattern, 'foobazbarbanana');

      t.end();
    });

    t.test('should return true when there are events to emit', t => {
      let e = new Node()
        , called = 0;

      e.on('foo', function () {
        called++;
      });

      t.equal(e.emit('foo'), true);
      t.equal(e.emit('foob'), false);
      t.equal(called, 1);

      t.end();
    });

    t.test('receives the emitted events', t => {
      let e = new Node();

      e.on('data', function (a, b, c, d, undef) {
        t.equal(a, 'foo');
        t.equal(b, e);
        t.equal(c instanceof Date, true);
        t.equal(undef, undefined);
        t.equal(arguments.length, 3);

        t.end();
      });

      e.emit('data', 'foo', e, new Date());
    });

    t.test('emits to all event listeners', t => {
      let e = new Node()
        , pattern = [];

      e.on('foo', function () {
        pattern.push('foo1');
      });

      e.on('foo', function () {
        pattern.push('foo2');
      });

      e.emit('foo');

      t.equal(pattern.join(';'), 'foo1;foo2');

      t.end();
    });

    (function each(keys) {
      let key = keys.shift();

      if (!key) {
        return;
      }

      t.test('can store event which is a known property: ' + key, t => {
        let e = new Node();

        e.on(key, function (k) {
          t.equal(k, key);
          t.end();
        }).emit(key, key);
      });

      each(keys);
    })([
      'hasOwnProperty',
      'constructor',
      '__proto__',
      'toString',
      'toValue',
      'unwatch',
      'watch'
    ]);

    t.end();
  });

  t.end();
});