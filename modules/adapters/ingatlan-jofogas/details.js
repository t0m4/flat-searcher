'use strict';
const Promise = require('bluebird');

const makeRequest = require('./request-and-parse');
const parser = require('./parser/details');

function* getDetails(item) {
  if (!item.link) {
    console.warn('Missing `link`', item);
    return {};
  }
  const res = yield makeRequest(item.link);
  return parser(res);

}

module.exports = Promise.coroutine(getDetails);
