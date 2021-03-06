'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');

const PER_PAGE_ITEM = 25;

const PROPS = {
  id: ($element) => parseInt($element.find('.reListItem').attr('id')),
  link: ($element) => $element.find('.subject').attr('href'),
  title: ($element) => _.trim($element.find('.subject').text()),
  price: ($element) => parseInt(_.trim($element.find('.priceBox').text()).split(' ').join(''), 10),
  rooms: ($element) => parseInt(_.trim($element.find('.sizeRooms .rooms').text()), 10),
  flatSize: ($element) => parseInt(_.trim($element.find('.sizeRooms .size').text()).split(' ')[0], 10),
  location: ($element) => _.trim($element.find('.cityname').text()),
};

function getNext($) {
  const $pagination = $('.pagination');
  if (!$pagination.length) return false;
  const $nextCandidate = $pagination.find('.active + li');
  const check = parseInt($nextCandidate.text());
  if ($nextCandidate.hasClass('disabled') || isNaN(check)) return false;
  return $nextCandidate.find('a').attr('href');
}

function getTotal($) {
  const total = _.trim($('.re-all-count > strong.jfg-badge').text());
  return Math.ceil(parseInt(total.split(' ').join(''), 10) / PER_PAGE_ITEM);
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
  const $elements = $('.main-box-body.search-list-container').find('[itemprop="itemListElement"]');
  const parsed = $elements.map(parseElement($)).toArray();
  const next = getNext($);
  const total = getTotal($);

  return Promise.resolve({ data: parsed, next, total });
}

module.exports = parse;
