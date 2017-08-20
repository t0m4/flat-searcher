'use strict';
const run = require('../common/run');

const options = {
  baseUrl: 'https://dh.hu/kiado-ingatlan/lakas/budapest/-/',
  source: 'dunahouse',
  makeRequest: require('./make-request'),
  listParser: require('./parser/list'),
  detailsParser: require('./parser/details')
};

module.exports = run(options);
