'use strict';
const search = require('./search');

function run(params, existing) {
  return search(params, existing);
}

module.exports = {
  source: 'jofogas',
  run
};
