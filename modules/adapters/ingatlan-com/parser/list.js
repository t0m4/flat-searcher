'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const BASE_URL = 'https://ingatlan.com';

const PROPS = {
  id: ($element) => parseInt($element.attr('data-id'), 10),
  link: ($element) => `${BASE_URL}${$element.find('a.listing__thumbnail').attr('href')}`,
  price: ($element) => parseInt(_.trim($element.find('.price').text()).toLowerCase().split(' ft')[0].split(' ').join(''), 10),
  rooms: ($element) => parseInt(_.trim($element.find('.listing__data--room-count').text()).split(' ')[0], 10),
  flatSize: ($element) => parseInt(_.trim($element.find('.listing__data--area-size').text()).split(' ')[0], 10),
  district: ($element) => _.trim($element.find('.listing__address').text().toLowerCase()).split(', ')[1].split(' ')[0].split('.')[0]
};

function getNext($) {
  const $nextButton = $('a.pagination__button').last();
  if (_.trim($nextButton.text()) === 'Előző oldal') return false;

  return $nextButton.attr('href');
}

function getTotal($) {
  const pageNumberSection = _.trim($('div.pagination__page-number').text());
  return parseInt(pageNumberSection.split(' / ')[1].split(' ')[0], 10);
}

function parseElement($) {
  return (index, $element) => {
    return _.mapValues(PROPS, (prop) => {
      return prop($($element));
    });
  }
}

function parse(response) {
  const $ = cheerio.load(response, { normalizeWhitespace: true });
  const $elements = $('.resultspage__listings').find('.listing');

  const parsed = $elements.map(parseElement($)).toArray();
  const next = getNext($);
  const total = getTotal($);

  return Promise.resolve({ data: parsed, next, total });
}

module.exports = parse;
