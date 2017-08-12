'use strict';
const Promise = require('bluebird');

const searcher = require('./modules/searcher');

const PARAMS = {
  rooms: {
    max: 1
  },
  halfRooms: {
    max: 1
  },
  //animalFriendly: true,
  //baclony: true,
  /*price: {
    max: 120000
  }/*,
  location: {
    districts: ['v.', 'vi.', 'vii.', 'viii.']
  }*/
};

searcher(PARAMS)
  .then(() => {
    console.log('finished');
  })
  .catch(err => console.error(err));
  //.then(() => process.exit(0));
