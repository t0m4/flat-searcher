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
  parsed.date = new Date(htmlDetailsObject.date);
  return Promise.resolve({ data: parsed });
}

module.exports = parse;
