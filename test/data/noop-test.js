var tape = require('tape'),
    vega = require('../../'),
    changeset = vega.changeset;

tape('NoOp propagates pulse', function(test) {
  var data = [{'id': 0}, {'id': 1}];

  var df = new vega.Dataflow(),
      c = df.add(vega.Collect),
      n = df.add(vega.NoOp, {pulse:c}),
      p;

  df.pulse(c, changeset().insert(data)).run();
  p = n.pulse;
  test.equal(p, c.pulse);
  test.equal(p.source, c.value);
  test.equal(p.add.length, 2);
  test.equal(p.rem.length, 0);
  test.equal(p.mod.length, 0);

  test.end();
});
