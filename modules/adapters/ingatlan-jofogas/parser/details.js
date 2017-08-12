'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const PROPS = {
  id: ($element) => parseInt($element.find('.manage_id').text().split(': ')[1]),
  /*price: ($element) => {
    const val = _.trim($element.find('.price2 .price2-value').text());
    const unit = _.trim($element.find('.price2 .price2-unit').text());
    return `${val} ${unit}`;
  },*/
  district: ($element) => _.trim($element.find('[itemprop="addressLocality"]').text()),
  rooms: ($element) => _.trim($element.find('.rePCAP-rooms .reParamValue').text()),
  halfRooms: ($element) => _.trim($element.find('.rePCAP-half_room .reParamValue').text()) || 0,
  balcony: ($element) => _.trim($element.find('.rePCAP-balcony .reParamValue').text()) === 'Van',
  deposit: ($element) => _.trim($element.find('.rePCAP-deposit .reParamValue').text()),
  buildingType: ($element) => _.trim($element.find('.rePCAP-building_type .reParamValue').text()),
  size: ($element) => _.trim($element.find('.rePAP-size .reParamValue').text()),
  availability: ($element) => _.trim($element.find('.rePCAP-availability .reParamValue').text()),
  equipments: ($element) => _.trim($element.find('.rePCAP-re_equipments .reParamValue').text().split(',')),
  animalFriendly: ($element) => _.trim($element.find('.rePCAP-animal_friendly .reParamValue').text()) === 'igen',
  hasFurniture: ($element) => _.trim($element.find('.rePCAP-has_furniture .reParamValue').text()) === 'igen',
  description: ($element) => _.trim($element.find('.description').text()),
  creaAt: ($element) => _.trim($element.find('.date .time').text())
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
