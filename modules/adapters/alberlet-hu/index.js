'use strict';
const run = require('../common/run');

const options = {
  baseUrl: 'https://www.alberlet.hu/kiado_alberlet/budapesti_alberletek',
  source: 'alberlet.hu',
  listParser: require('./parser/list'),
  detailsParser: require('./parser/details')
};

module.exports = run(options);
