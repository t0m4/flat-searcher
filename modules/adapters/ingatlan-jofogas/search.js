'use strict';
const urlTool = require('url');
const Promise = require('bluebird');
const _ = require('lodash');

const parser = require('./parser/list');
const filter = require('./filter');
const makeRequest = require('./request-and-parse');

const details = require('./details');

const BASE_URL = 'https://ingatlan.jofogas.hu/budapest/felujitott+jo-allapotu+uj-epitesu+ujszeru/lakas?f=a&sp=1&hi=1&st=u';

function factory(url, params, existingIds) {
  let nextUrl = url;

  return {
    next: Promise.coroutine(function* () {
      const res = yield makeRequest(nextUrl);
      const parsed = yield parser(res);
      nextUrl = parsed.next;

      const populated = yield Promise.map(parsed.data, (data) => {
        if (_.includes(existingIds, data.id)) return Promise.resolve(data);
        return details(data)
          .then(detailsData => _.defaults(data, detailsData.data));
      });

      const filteredData = filter(params, populated, existingIds);
      const data = {
        data: filteredData,
        total: parsed.total
      };
      return { value: data, done: !nextUrl };
    })
  };
}

function constructUrl(params) {
  const getParams = [];
  if (_.get(params, 'rooms.max')) getParams.push(`roe=${params.rooms.max}`);
  if (_.get(params, 'rooms.min')) getParams.push(`ros=${params.rooms.min}`);
  return getParams.length ? `${BASE_URL}&${getParams.join('&')}` : BASE_URL;
}

const getData = Promise.coroutine(function* (url, params, existingIds) {
  const now = Date.now();
  let data = [];
  let newData;
  let shouldRun = true;
  let total;

  const dataFactory = factory(url, params, existingIds);
  let page = 1;
  while(shouldRun) {
    newData = yield dataFactory.next();
    shouldRun = !newData.done;
    if (!total) {
      total = newData.value.total;
      console.info('Total: ', total);
    }

    data = data.concat(newData.value.data);
    page++;
  }
  console.info(`Jofogas: processed ${page} page(s) with ${data.length} hits in ${Date.now() - now}ms`);
  return data;
});


function* search(params, existing) {
  let existingIds = [];
  if (existing) existingIds = _.map(existing, 'id');
  const url = constructUrl(params);
  console.info('Search started on Jofogas - ingatlanok', url);
  const response = yield makeRequest(url);
  const data = yield getData(url, params, existingIds);

  console.info(`Search finished on Jofogas - ingatlanok`);
  return data;
}

module.exports = Promise.coroutine(search);
