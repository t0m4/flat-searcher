'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const BASE_URL = 'https://www.alberlet.hu';

const PROPS = {
  id: ($element) => parseInt($element.attr('data-listing-id'), 10),
  link: ($element) => {
    let link = $element.find('a.advert__image-link').attr('href');
    if (!_.includes(link, 'http')) link = `${BASE_URL}${link}`;
    return link;
  },
  price: ($element) => parseInt(_.trim($element.find('.advert__price b').text()).toLowerCase().split(' ').join(''), 10),
  rooms: ($element) => parseInt(_.trim($element.find('.advert__rooms').text()).split(' ')[0], 10),
  flatSize: ($element) => parseInt(_.trim($element.find('.advert__address-line2').text()).split(' m')[0], 10),
  district: ($element) => _.trim($element.find('.advert__city').text().toLowerCase()).split(', ')[1].split(' ')[0].split('.')[0]
};

function getNext($) {
  const $nextButton = $('a.next');
  if (!$nextButton.length || $nextButton.attr('disabled')) return false;

  return `${BASE_URL}${$nextButton.attr('href')}`;
}

function getTotal($) {
  return 'Unknown';
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
  const $elements = $('#listing-index').find('.advert-list__item');

  const parsed = $elements.map(parseElement($)).toArray();
  const next = getNext($);
  const total = getTotal($);

  return Promise.resolve({ data: parsed, next, total });
}

module.exports = parse;
