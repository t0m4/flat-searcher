'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const PROPS = {
  id: ($element) => parseInt($element.find('.manage_id').text().split(': ')[1]),
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
  description: ($element) => _.trim($element.find('.description').text())
};

function parseElement($, $element) {
  return _.mapValues(PROPS, (prop) => {
    return prop($($element));
  });
}

function extractObject(target, variable){
  const chopFront = target.substring(target.search(variable) + variable.length, target.length);
  const result = chopFront.substring(0, chopFront.search(';'));

  return _.trim(result.replace(/(encodeURIComponent|\(|\)|\n|{|})/g, ''));
}

function htmlDetailObj($) {
  const findAndClean = extractObject(_.trim($.html()),"var utag_data = ");
  let asd = findAndClean.split(', ');
  return _.reduce(asd, (obj, asdka) => {
    const splitted = asdka.split(' : ');
    obj[splitted[0]] = (splitted[1] || '').replace(/"/g, '');
    return obj;
  }, {});
}

function parse(response) {
  const $ = cheerio.load(response, { normalizeWhitespace: true });
  const $element = $('#main_content .main-content #vi');

  const htmlDetailsObject = htmlDetailObj($)

  const parsed = parseElement($, $element);
  parsed.creaAt = new Date(htmlDetailsObject.date);
  return Promise.resolve({ data: parsed });
}

module.exports = parse;
