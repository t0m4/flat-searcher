'use strict';
const run = require('../common/run');

const options = {
  baseUrl: 'https://ingatlan.jofogas.hu/budapest/felujitott+jo-allapotu+uj-epitesu+ujszeru/lakas?f=a&sp=1&hi=1&st=u',
  source: 'jofogas',
  makeRequest: require('./make-request'),
  listParser: require('./parser/list'),
  detailsParser: require('./parser/details'),
  constructUrl: require('./construct-url')
};

module.exports = run(options);
