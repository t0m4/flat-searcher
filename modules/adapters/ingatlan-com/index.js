'use strict';
const run = require('../common/run');

const options = {
  baseUrl: 'https://ingatlan.com/szukites/kiado+lakas+uj-epitesu+csak-kepes+budapest',
  source: 'ingatlan.com',
  listParser: require('./parser/list'),
  detailsParser: require('./parser/details')
};

module.exports = run(options);
