var tape = require('tape'),
    vega = require('../../'),
    changeset = vega.changeset;

tape('Rank ranks tuples', function(test) {
  var data = [
    {"x": 0, "y": 28}, {"x": 1, "y": 43},
    {"x": 0, "y": 55}, {"x": 1, "y": 72}
  ];

  var rank = vega.field('rank'),
      x = vega.field('x'),
      df = new vega.Dataflow(),
      f = df.add(null),
      n = df.add(false),
      c = df.add(vega.Collect),
      r = df.add(vega.Rank, {field:f, normalize:n, pulse:c});

  df.pulse(c, changeset().insert(data)).run();
  test.deepEqual(c.value.map(rank), [0, 1, 2, 3]);
  test.equal(r.pulse.add.length, 4);

  df.update(n, true).run();
  test.deepEqual(c.value.map(rank), [0, 1/3, 2/3, 1]);
  test.equal(r.pulse.mod.length, 4);

  df.update(n, false).update(f, x).run();
  test.deepEqual(c.value.map(rank), [0, 1, 0, 1]);
  test.equal(r.pulse.mod.length, 4);

  df.update(n, true).run();
  test.deepEqual(c.value.map(rank), [0, 1, 0, 1]);
  test.equal(r.pulse.mod.length, 4);

  test.end();
});
