'use strict';
const _ = require('lodash');

function minMaxFilter(toCompareWith, config) {
  if (!config.min && !config.max) return true;
  if (isNaN(toCompareWith)) return false;
  if (config.min && toCompareWith < config.min) return false;
  if (config.max && toCompareWith > config.max) return false;

  return true;
}

function booleanFilter(toCompareWith, config) {
  if (!_.isBoolean(config)) return true;
  return toCompareWith === config;
}

const CONDITIONS = {
  rooms: (config, item) => {
    if (_.isUndefined(item.rooms)) return true;
    const size = parseInt(item.rooms, 10);
    return minMaxFilter(size, config);
  },
  halfRooms: (config, item) => {
    if (_.isUndefined(item.halfRooms)) return true;
    const size = parseInt(item.halfRooms, 10);
    return minMaxFilter(size, config);
  },
  price: (config, item) => {
    if (_.isUndefined(item.price)) return true;
    const price = parseInt(item.price.split(' ').join(''), 10);
    return minMaxFilter(price, config);
  },
  location: (config, item) => {
    if (_.isUndefined(item.districts)) return true;
    if (config.districts) {
      const loc = item.district.toLowerCase();
      return _.some(_.map(config.districts, district => district === loc));
    }
    return true;
  },
  animalFriendly: (config, item) => {
    if (_.isUndefined(item.animalFriendly)) return true;
    return booleanFilter(item.animalFriendly, config);
  },
  balcony: (config, item) => {
    if (_.isUndefined(item.balcony)) return true;
    return booleanFilter(item.balcony, config);
  }
}

function runCondition(params, item) {
  return (fn, key) => {
    const res = fn(_.get(params, key, {}), item);
    return res;
  };
}

function filter(params, arr) {
  const notEligibleIds = [];
  const filtered = _.filter(arr, item => {
    const conditions = _.pick(CONDITIONS, _.keys(params));
    const result = _.every(_.map(conditions, runCondition(params, item)));
    if (!result) notEligibleIds.push(item.id);
    return result;
  });

  return {
    filtered,
    notEligibleIds
  };
}

module.exports = _.curry(filter);
