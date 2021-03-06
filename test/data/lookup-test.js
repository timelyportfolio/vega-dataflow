var tape = require('tape'),
    vega = require('../../'),
    changeset = vega.changeset;

tape('Lookup looks up matching tuples', function(test) {
  var lut = [
    {'id': 1, 'value': 'foo'},
    {'id': 3, 'value': 'bar'},
    {'id': 5, 'value': 'baz'}
  ];

  var data = [
    {'id': 0, 'x': 5, 'y': 1},
    {'id': 1, 'x': 3, 'y': 5},
    {'id': 2, 'x': 1, 'y': 5},
    {'id': 3, 'x': 3, 'y': 3}
  ];

  var uv = vega.field('u.value'),
      vv = vega.field('v.value'),
      id = vega.field('id'),
      x  = vega.field('x'),
      y  = vega.field('y'),

      df = new vega.Dataflow(),
      c0 = df.add(vega.Collect),
      ti = df.add(vega.TupleIndex, {field:id, pulse:c0}),
      c1 = df.add(vega.Collect),
      lk = df.add([x,y]),
      lu = df.add(vega.Lookup, {index:ti, fields:lk, as:['u','v'], pulse:c1});

  df.run(); // initialize

  // add lookup table
  df.pulse(c0, changeset().insert(lut)).run();
  test.equal(Object.keys(ti.value).length, 3);

  // add primary data
  df.pulse(c1, changeset().insert(data)).run();
  var p = lu.pulse.add;
  test.equal(p.length, 4);
  test.deepEqual(p.map(uv), ['baz', 'bar', 'foo', 'bar']);
  test.deepEqual(p.map(vv), ['foo', 'baz', 'baz', 'bar']);

  // swap lookup keys
  df.update(lk, [y,x]).run();
  p = lu.pulse.mod;
  test.equal(p.length, 4);
  test.deepEqual(p.map(vv), ['baz', 'bar', 'foo', 'bar']);
  test.deepEqual(p.map(uv), ['foo', 'baz', 'baz', 'bar']);

  test.end();
});
