'use strict';
const Promise = require('bluebird');

function* getDetails(item, options) {
  if (!item.link) {
    console.warn('Missing `link`', item);
    return {};
  }
  const res = yield options.makeRequest(item.link);
  return options.detailsParser(res);

}

module.exports = Promise.coroutine(getDetails);
