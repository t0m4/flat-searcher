'use strict';
const promiseRetry = require('promise-retry');
const Promise = require('bluebird');
const _ = require('lodash');

const MAX_RETRIES = 5;

function handleRetry(fn) {
  const startRetry = () => promiseRetry((retry, number) => {
    return fn()
      .catch((err) => {
        // Only retry for server and network issues
        if (err.statusCode > 499 || _.includes(['ENOTFOUND', 'ETIMEDOUT'], err.code)) {
          console.log({ message: 'Retrying request', attempt: number, maxAttempt: MAX_RETRIES });
          return retry(err);
        }
        throw err;
      });
  }, {
    retries: MAX_RETRIES,
    factor: 1.5,
    minTimeout: 500
  });

  return Promise.resolve(startRetry());
}

module.exports = handleRetry;
