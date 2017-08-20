'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const PROPS = {
  district: ($element) => _.trim($element.find('[itemprop="addressLocality"]').text()).split('.')[0].toLowerCase(),
  halfRooms: ($element) => _.trim($element.find('.rePCAP-half_room .reParamValue').text()) || 0,
  balcony: ($element) => _.trim($element.find('.rePCAP-balcony .reParamValue').text()) === 'Van',
  animalFriendly: ($element) => _.trim($element.find('.rePCAP-animal_friendly .reParamValue').text()) === 'igen',
  description: ($element) => _.trim($element.find('.description').text())
};

function parseElement($, $element) {
  return _.mapValues(PROPS, (prop) => {
    return prop($($element));
  });
}

function parse(response) {
  const $ = cheerio.load(response, { normalizeWhitespace: true });
  const $element = $('#main_content .main-content #vi');

  const parsed = parseElement($, $element);
  return Promise.resolve({ data: parsed });
}

module.exports = parse;
