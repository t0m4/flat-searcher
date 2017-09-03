'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const romanize = require('romanize');

const PROPS = {
  /*balcony: ($element) => {
    const balcony = _.trim($element.find('.paramterers table').last().find('tbody tr:nth-child(5) td:nth-child(2)').text());
    return !_.includes(['nem', 'nincs megadva'], balcony);
  },*/
  animalFriendly: (props) => {
    return props['kisallat_johet'] || false;
  }
};

function parseElement($, $element) {
  return _.mapValues(PROPS, (prop) => {
    return prop($($element));
  });
}

function parse(response) {
  const $ = cheerio.load(response, { normalizeWhitespace: true });
  const $element = $('.profile-table tbody');

  const props = {};

  $element.find('tr').each((index, elem) => {
    const key = _.snakeCase(_.trim($(elem).find('td').first().text()));
    const value = _.trim($(elem).find('td').last().text());
    props[key] = value;
  });

  const parsed = parseElement($, $element);

  return Promise.resolve({ data: parsed });
}

module.exports = parse;
