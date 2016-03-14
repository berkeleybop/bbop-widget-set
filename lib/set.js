/* 
 * The framework to hang the rest of the ol' BBOP widgets on.
 *
 * @module: bbop-widget-set
 */

var us = require('underscore');
var bbop = require('bbop-core');

/**
 * "Constructor" for bbop-widget-set.
 * 
 * Parameters:
 *  n/a
 *
 * @constructor 
 * @returns {Object} bbop-widget-set object
 */
var set = function(more_dispatch){
    this._is_a = 'bbop-widget-set';

    var anchor = this;

    // // The (TODO: now unused?) API lib.
    // this.api = require('./api');

    // // TODO: No longer necessary w/NPM switch.
    // this.version = require('./version');

    // // TODO: Not entirely sure what this was doing anyways.
    //this.data.statistics = require('./data/statistics');

};

///
/// Exportable body.
///

module.exports.set = set;
module.exports.autocomplete_simple = require('./autocomplete_simple');
