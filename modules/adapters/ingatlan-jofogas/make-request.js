'use strict';
const rp = require('request-promise');
const Iconv  = require('iconv').Iconv;
const iconv = new Iconv('ISO-8859-2', 'UTF-8');

const handleRetry = require('../../retry');

function makeRequest(url) {
  return handleRetry(() => {
    return rp.get({
      url,
      encoding: null
    });
  })
  .then(res => {
    const buffer = iconv.convert(res);
    return buffer.toString('UTF8');
  });
}

module.exports = makeRequest;