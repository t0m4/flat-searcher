'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const romanize = require('romanize');

const PROPS = {
  balcony: ($element) => {
    const balcony = _.trim($element.find('.paramterers table').last().find('tbody tr:nth-child(5) td:nth-child(2)').text());
    return !_.includes(['nem', 'nincs megadva'], balcony);
  },
  animalFriendly: ($element) => {
    const animalFriendly = _.trim($element.find('.paramterers table').last().find('tbody tr:nth-child(9) td:nth-child(2)').text());
    return !_.includes(['nem megengedett', 'nincs megadva', 'nem hozható'], animalFriendly);
  },
  description: ($element) => _.trim($element.find('[itemprop="description"]').text())
};

function parseElement($, $element) {
  return _.mapValues(PROPS, (prop) => {
    return prop($($element));
  });
}

function parse(response) {
  const $ = cheerio.load(response, { normalizeWhitespace: true });
  const $element = $('div.card.details');

  const parsed = parseElement($, $element);

  return Promise.resolve({ data: parsed });
}

module.exports = parse;
