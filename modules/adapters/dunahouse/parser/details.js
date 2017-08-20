'use strict';
const Promise = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const romanize = require('romanize');

const PROPS = {
  district: ($element) => {
    const district = _.trim($element.find('.datas > div div:nth-child(3) div:nth-child(2)').text()).split(' ')[0];
    return romanize(district).toLowerCase();
  },
  balcony: ($element) => {
    const balcony = _.trim($element.find('.datas div:nth-child(2) div:nth-child(3) div:nth-child(2)').text());
    return balcony === 'van';
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
  const $element = $('.estateContent');

  const parsed = parseElement($, $element);

  return Promise.resolve({ data: parsed });
}

module.exports = parse;
