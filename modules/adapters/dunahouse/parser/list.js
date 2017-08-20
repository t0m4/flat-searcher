'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const BASE_URL = 'https://dh.hu';

const PROPS = {
  id: ($element) => {
    const idTxt = $element.attr('class').split(/\s+/)[1];
    return idTxt.split('propertyListItemId')[1];
  },
  link: ($element) => `${BASE_URL}${$element.find('.moreDetailsBox a').attr('href')}`,
  title: ($element) => _.trim($element.find('h2[itemprop="name"]').text()),
  price: ($element) => _.trim($element.find('.priceBox span[itemprop="price"]').text()),
  rooms: ($element) => parseInt(_.trim($element.find('.listItemDatas .room .value').text().split(' ')[0]), 10),
  flatSize: ($element) => _.trim($element.find('.listItemDatas .size .value').text())
};

function getNext($) {
  const $buttons = $('.pagerbuttons button');
  const $nextButton = $($buttons.get(1));
  if ($nextButton.hasClass('disabled')) return false;

  return `${BASE_URL}${$nextButton.attr('onclick').split(`'`)[1]}`;
}

function getTotal($) {
  const $pagination = $('ul.pagination');
  const $listItems = $pagination.find('li');
  const $lastPage = $($listItems.get($listItems.length - 2));

  return parseInt(_.trim($lastPage.find('a').text()), 10);
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
  const $elements = $('.propertylist-results-items').find('.propertyListItem');

  const parsed = $elements.map(parseElement($)).toArray();
  const next = getNext($);
  const total = getTotal($);

  return Promise.resolve({ data: parsed, next, total });
}

module.exports = parse;
