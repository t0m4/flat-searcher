'use strict';
const Joi = require('joi');
const _ = require('lodash');
const romanize = require('romanize');

const districts = [];

_.times(23, (index) => {
  districts.push(romanize(index + 1).toLowerCase())
});

const schema = Joi.object().keys({
  price: Joi.number(),
  rooms: Joi.number(),
  district: Joi.string().allow(districts),
  flatSize: Joi.number()
});

function validate(item) {
  const result = Joi.validate(item, schema);
  console.log(result);
  if (result.error) throw result.error;
  return true;
}

module.exports = {
  validate
};
