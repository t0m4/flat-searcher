'use strict';
const search = require('./search');

function run(options) {
  return (params, existing) => search(params, existing, options);
}

module.exports = (options) => ({
  source: options.source,
  run: run(options)
});
