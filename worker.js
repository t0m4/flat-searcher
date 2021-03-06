'use strict';
const Promise = require('bluebird');

const { login, send } = require('./services/fbmessage');
const searcher = require('./modules/searcher');

const { connect } = require('./services/mongo');

const DEFAULT_PARAMS = {
  rooms: {
    max: 2
  },
  halfRooms: {
    max: 2
  },
  location: {
    districts: ['v', 'vi', 'vii', 'viii', 'xi']
  },
  price: {
    max: 110000,
    min: 90000
  },
  animalFriendly: true
};

let PARAMS = {};

try {
  const PARAMS = JSON.parse(process.env.PARAMS);
} catch(err) {
  PARAMS = DEFAULT_PARAMS;
}

function* startUp() {
  yield login();

  return searcher(PARAMS);
}

connect()
  .then(Promise.coroutine(startUp))
  .catch(err => console.error(err))
  .then(() => Promise.delay(5000))
  .then(() => {
    console.info('finished');
    process.exit(0);
  });
