'use strict';

/**
 * npm modules import
 */
var redis = require('redis');
var bodyParser = require('body-parser');
var request = require('request-promise');

/**
 * import project modules
 */
var helpers = require('./helpers');
var Exchanges = require('./exchanges');
var bluebird = require('bluebird');

//Here wil be an algorithm which will call all the setUp  methods of the different exchanges periodically and manage failures.
module.exports = function () {
  console.log('firing raw data miner');
};
//# sourceMappingURL=miner.js.map