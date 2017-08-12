'use strict';
const urlTool = require('url');
const Promise = require('bluebird');
const _ = require('lodash');

const parser = require('./parser/list');
const filter = require('./filter');
const makeRequest = require('./request-and-parse');

const details = require('./details');

const URL = 'https://ingatlan.jofogas.hu/budapest/lakas/felujitott+jo-allapotu+uj-epitesu+ujszeru/van-1?hi=1&ros=3&st=u';

function factory(url, params, existingIds) {
  let nextUrl = url;

  return {
    next: Promise.coroutine(function* () {
      const res = yield makeRequest(nextUrl);
      const parsed = yield parser(res);
      nextUrl = parsed.next;

      const populated = yield Promise.map(parsed.data, (data) => {
        return details(data)
          .then(detailsData => _.defaults(data, detailsData.data));
      });

      const filteredData = filter(params, populated, existingIds);

      return { value: filteredData, done: !nextUrl };
    })
  };
}

const getData = Promise.coroutine(function* (params, existingIds) {
  const now = Date.now();
  let data = [];
  let newData;
  let shouldRun = true;

  const dataFactory = factory(URL, params, existingIds);
  let page = 1;
  while(shouldRun) {
    newData = yield dataFactory.next();
    shouldRun = !newData.done;
    //shouldRun = false;
    data = data.concat(newData.value);
    page++;
  }
  console.info(`Jofogas: processed ${page} page(s) with ${data.length} hits in ${Date.now() - now}ms`);
  return data;
});


function* search(params, existing) {
  let existingIds = [];
  if (existing) existingIds = _.map(existing, 'id');
  console.info('Search started on Jofogas - ingatlanok');
  const response = yield makeRequest(URL);
  const data = yield getData(params, existingIds);

  console.info(`Search finished on Jofogas - ingatlanok`);
  return data;
}

module.exports = Promise.coroutine(search);
