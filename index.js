'use strict';

/**
 * @module loaders.readme
 */

const md = require('./lib/md');
const loaderUtils = require('loader-utils');
const helpers = require('./lib/helpers');
const filter = require("lodash/filter");
const _ = require('./lib/lodash');
const checks = require('./lib/checks');

/**
* @summary Parses a readme source into object
* @function
* @public
*
* @param {String} source - A README.markdown string
* @returns {Object} - an object with extracted properties from the markdown
* @returns {Object.title} - the first heading
* @returns {Object.lead} - the first after Object.title
* @returns {Object.logo} - url of an image with where alt=logo
* @returns {Object.screenshot} - url of an image with where alt=screenshot
* @example
* const README = require('readme-parser')(source);
* console.log(README)
*/

module.exports = function(source) {
  const tree = md.parse(source, {});

  const obj = {
    title: (tokens => (
      _(tokens)
        .chain()
        .filterByType('heading')
        .filter(t => !helpers.tokenContains(t, checks.badges))
        .head()
        .getContent()
        .value()
      )
    )(_.cloneDeep(tree)),
    lead: (tokens => (
      _(tokens)
        .chain()
        .filterByType('paragraph')
        .filter(t => !helpers.tokenContains(t, checks.badges))
        .head()
        .getContent()
        .value()
      )
    )(_.cloneDeep(tree)),
    badges: (tokens => (
      _(tokens)
        .filterByType('paragraph')
        .filter(t => helpers.tokenContains(t, checks.badges))
        .getContent()
        .join('')
      )
    )(_.cloneDeep(tree)),
    installation: helpers.contentByTitle(_.cloneDeep(tree), checks.installation),
    features: helpers.contentByTitle(_.cloneDeep(tree), checks.features),
    contribute: helpers.contentByTitle(_.cloneDeep(tree), checks.contribute),
    license: helpers.contentByTitle(_.cloneDeep(tree), checks.license),
  };

  return helpers.renderToHtml(obj);
};
