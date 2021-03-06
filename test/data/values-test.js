var tape = require('tape'),
    vega = require('../../'),
    changeset = vega.changeset;

tape('Values extracts values', function(test) {
  var data = [
    {k:'a', v:1}, {k:'b', v:3},
    {k:'c', v:2}, {k:'d', v:4}
  ];

  var key = vega.field('k'),
      df = new vega.Dataflow(),
      srt = df.add(null),
      col = df.add(vega.Collect),
      val = df.add(vega.Values, {field:key, sort:srt, pulse:col});

  df.pulse(col, changeset().insert(data)).run();
  var values = val.value;
  test.deepEqual(values, ['a', 'b', 'c', 'd']);

  df.touch(val).run(); // no-op pulse
  test.equal(val.value, values); // no change!

  df.update(srt, vega.compare('v', 'descending')).run();
  test.deepEqual(val.value, ['d', 'b', 'c', 'a']);

  test.end();
});

tape('Values extracts sorted domain values', function(test) {
  var byCount = vega.compare('count', 'descending'),
      key = vega.field('k'),
      df = new vega.Dataflow(),
      col = df.add(vega.Collect),
      agg = df.add(vega.Aggregate, {groupby:key, pulse:col}),
      out = df.add(vega.Collect, {pulse:agg}),
      val = df.add(vega.Values, {field:key, sort:byCount, pulse:out});

  // -- initial
  df.pulse(col, changeset().insert([
    {k:'b', v:1}, {k:'a', v:2}, {k:'a', v:3}
  ])).run();
  test.deepEqual(val.value, ['a', 'b']);

  // -- update
  df.pulse(col, changeset().insert([
    {k:'b', v:1}, {k:'b', v:2}, {k:'c', v:3}
  ])).run();
  test.deepEqual(val.value, ['b', 'a', 'c']);

  test.end();
});

tape('Values extracts multi-domain values', function(test) {
  var byCount = vega.compare('count', 'descending'),
      count = vega.field('count'),
      key = vega.field('key'),
      k1 = vega.field('k1', 'key'),
      k2 = vega.field('k2', 'key'),
      df = new vega.Dataflow(),
      col = df.add(vega.Collect),
      ag1 = df.add(vega.Aggregate, {groupby:k1, pulse:col}),
      ca1 = df.add(vega.Collect, {pulse:ag1}),
      ag2 = df.add(vega.Aggregate, {groupby:k2, pulse:col}),
      ca2 = df.add(vega.Collect, {pulse:ag2}),
      sum = df.add(vega.Aggregate, {groupby:key,
        fields:[count], ops:['sum'], as:['count'], pulse:[ca1, ca2]}),
      out = df.add(vega.Collect, {sort:byCount, pulse:sum}),
      val = df.add(vega.Values, {field:key, pulse:out});

  // -- initial
  df.pulse(col, changeset().insert([
    {k1:'b', k2:'a'}, {k1:'a', k2:'c'}, {k1:'c', k2:'a'}
  ])).run();
  test.deepEqual(val.value, ['a', 'c', 'b']);

  // -- update
  df.pulse(col, changeset().insert([
    {k1:'b', k2:'b'}, {k1:'b', k2:'c'}, {k1:'b', k2:'c'}
  ])).run();
  test.deepEqual(val.value, ['b', 'c', 'a']);

  test.end();
});
