'use strict';
const _ = require('lodash');

function constructUrl(params, options) {
  const getParams = [];
  if (_.get(params, 'rooms.max')) getParams.push(`roe=${params.rooms.max}`);
  if (_.get(params, 'rooms.min')) getParams.push(`ros=${params.rooms.min}`);
  return getParams.length ? `${options.baseUrl}&${getParams.join('&')}` : options.baseUrl;
}

module.exports = constructUrl;
