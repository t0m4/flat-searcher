'use strict';
const Promise = require('bluebird');
const _ = require('lodash');

const details = require('./details');
const filter = require('./filter');
const { updateLastSeen, getFlat, storeNotEligible, isItemStoredAsNotEligible } = require('../../../services/mongo');

const filterExisting = Promise.coroutine(function* (item, params, options) {
  const uniqid = `${options.source}:${item.id}`;
  const found = yield getFlat({ uniqid });
  const storedAsNotEligible = yield isItemStoredAsNotEligible(item, params, options);
  if (!found && !storedAsNotEligible) {
    return true;
  }
  yield updateLastSeen(uniqid);
  return false;
});

function factory(params, existingIds, options) {
  let nextUrl = options.baseUrl;

  return {
    next: Promise.coroutine(function* () {
      const res = yield options.makeRequest(nextUrl);
      const parsed = yield options.listParser(res);
      nextUrl = parsed.next;

      const itemsToPopulate = yield Promise.filter(parsed.data, (item) => filterExisting(item, params, options));

      const populated = yield Promise.map(itemsToPopulate, (data) => {
        return details(data, options)
          .then(detailsData => _.defaults(data, detailsData.data))
          .catch((err) => {
            console.error(err);
            return data;
          });
      });

      const filteredData = filter(params, populated);

      yield Promise.all(_.map(filteredData.notEligibleIds, id => storeNotEligible(id, params, options)));

      const data = {
        data: filteredData.filtered,
        total: parsed.total
      };
      return { value: data, done: !nextUrl };
    })
  };
}

function* getData(params, existingIds, options) {
  const now = Date.now();
  let data = [];
  let newData;
  let shouldRun = true;

  const dataFactory = factory(params, existingIds, options);
  let page = 1;
  while(shouldRun) {
    newData = yield dataFactory.next();
    shouldRun = !newData.done;

    data = data.concat(newData.value.data);
    console.info(`${options.source}: Progress ${page}/${newData.value.total} pages.`);
    if (shouldRun) page++;
  }
  console.info(`${options.source}: processed ${page} page(s) with ${data.length} hits in ${Date.now() - now}ms`);
  return data;
}

module.exports = Promise.coroutine(getData);
