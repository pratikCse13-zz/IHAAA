/**
 * npm modules import
 */
var bodyParser = require('body-parser')
var request = require('request-promise')
var fs = require('fs');

/**
 * import project modules
 */
var helpers = require('./helpers')
var Exchanges = require('./exchanges')
var bluebird = require('bluebird')

setInterval(() => {
	var Bittrex = new Exchanges.bittrex;
	Bittrex.refreshMarkets();
}, 600);

