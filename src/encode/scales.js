import * as $ from 'd3-scale';
import scaleIndex from './scaleIndex';

var scales = {
  // base scale types
  band:        $.scaleBand,
  point:       $.scalePoint,
  identity:    $.scaleIdentity,
  linear:      $.scaleLinear,
  log:         $.scaleLog,
  ordinal:     $.scaleOrdinal,
  pow:         $.scalePow,
  sqrt:        $.scaleSqrt,
  quantile:    $.scaleQuantile,
  quantize:    $.scaleQuantize,
  threshold:   $.scaleThreshold,
  time:        $.scaleTime,
  utc:         $.scaleUtc,
  sequential:  $.scaleSequential,
  index:       scaleIndex
};

export default function scale(name, scale) {
  return arguments.length > 1 ? (scales[name] = scale, this)
    : scales.hasOwnProperty(name) ? scales[name] : null;
}

