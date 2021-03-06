var tape = require('tape'),
    vega = require('../../'),
    changeset = vega.changeset;

tape('PreFacet partitions pre-faceted tuple sets', function(test) {
  var data = [
    {"id": "a", "tuples": [{x:1},{x:2}]},
    {"id": "b", "tuples": [{x:3},{x:4}]},
    {"id": "c", "tuples": [{x:5},{x:6}]}
  ];

  var subs = [];

  function subflow(df, key) {
    var col = df.add(vega.Collect);
    subs.push({key: key, data: col});
    return col;
  }

  function values(index) {
    return subs[index].data.value.map(function(_) { return _.x; });
  }

  var tuples = vega.field('tuples'),
      df = new vega.Dataflow(),
      source = df.add(vega.Collect),
      facet = df.add(vega.PreFacet, {subflow:subflow, field:tuples, pulse:source});

  // -- test add
  df.pulse(source, changeset().insert(data)).run();
  test.equal(facet.targets().active, 3); // 3 subflows updated
  test.equal(subs.length, 3); // 3 subflows added
  test.equal(subs[0].key, data[0]._id);
  test.equal(subs[1].key, data[1]._id);
  test.equal(subs[2].key, data[2]._id);
  test.deepEqual(values(0), [1, 2]);
  test.deepEqual(values(1), [3, 4]);
  test.deepEqual(values(2), [5, 6]);
  test.ok(subs[0].data.value[0]._id);
  test.ok(subs[0].data.value[1]._id);
  test.ok(subs[1].data.value[0]._id);
  test.ok(subs[1].data.value[1]._id);
  test.ok(subs[2].data.value[0]._id);
  test.ok(subs[2].data.value[1]._id);

  // -- test rem
  df.pulse(source, changeset().remove(data[0])).run();
  test.equal(facet.targets().active, 1); // 1 subflow updated
  test.equal(subs.length, 3); // no new subflows added
  test.deepEqual(values(0), []);
  test.deepEqual(values(1), [3, 4]);
  test.deepEqual(values(2), [5, 6]);

  // -- test add - repopulate subflow
  df.pulse(source, changeset().insert(data[0])).run();
  test.equal(facet.targets().active, 1); // 1 subflow updated
  test.equal(subs.length, 3); // no new subflows added
  test.deepEqual(values(0), [1, 2]);
  test.deepEqual(values(1), [3, 4]);
  test.deepEqual(values(2), [5, 6]);

  // -- test add - new subflow
  df.pulse(source, changeset()
    .insert({"key": "d", "tuples": [{x:7},{x:8}]}))
    .run();
  test.equal(facet.targets().active, 1); // 1 subflow updated
  test.equal(subs.length, 4); // 1 subflow added
  test.deepEqual(values(0), [1, 2]);
  test.deepEqual(values(1), [3, 4]);
  test.deepEqual(values(2), [5, 6]);
  test.deepEqual(values(3), [7, 8]);
  test.ok(subs[3].data.value[0]._id);
  test.ok(subs[3].data.value[1]._id);

  test.end();
});
