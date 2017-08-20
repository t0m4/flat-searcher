'use strict';
const hash = require('object-hash');
const _ = require('lodash');

function toString(object) {
  return _.reduce(object, (total, value, key) => {
    if (_.isObject(value)) {
      total[key] = toString(value);
      return total;
    }
    total[key] = value.toString();
    return total;
  }, {});
}

module.exports = (obj) => hash(toString(obj));
