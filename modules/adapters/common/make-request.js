'use strict';
const rp = require('request-promise');

const handleRetry = require('../../retry');

function makeRequest(url) {
  return handleRetry(() => {
    return rp.get({
      url,
      timeout: 30000
    });
  });
}

module.exports = makeRequest;
