import Facet from './Facet';
import {ingest} from '../Tuple';
import {error, inherits} from 'vega-util';

/**
 * Partitions pre-faceted data into tuple subflows.
 * @constructor
 * @param {object} params - The parameters for this operator.
 * @param {function(Dataflow, string): Operator} params.subflow - A function
 *   that generates a subflow of operators and returns its root operator.
 * @param {function(object): Array<object>} params.field - The field
 *   accessor for an array of subflow tuple objects.
 */
export default function PreFacet(params) {
  Facet.call(this, params);
}

var prototype = inherits(PreFacet, Facet);

prototype.transform = function(_, pulse) {
  var self = this,
      flow = _.subflow,
      field = _.field;

  if (_.modified('field') || pulse.modified(field.fields)) {
    error('PreFacet does not support field modification.');
  }

  this._targets.active = 0; // reset list of active subflows

  pulse.visit(pulse.ADD, function(t) {
    var sf = self.subflow(t._id, flow, pulse);
    field(t).forEach(function(_) { sf.add(ingest(_)); });
  });

  pulse.visit(pulse.REM, function(t) {
    var sf = self.subflow(t._id, flow, pulse);
    field(t).forEach(function(_) { sf.rem(_); });
  });

  return pulse;
};
