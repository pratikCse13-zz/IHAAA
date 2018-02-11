/**
 * npm modules import
 */
var bodyParser = require('body-parser')
var request = require('request-promise')
var fs = require('fs')
var bluebird = require('bluebird')

/**
 * import project modules
 */
var helpers = require('./helpers')
var Exchanges = require('./exchanges')
var config = require('./config.js')
var algo = require('./algo.js')

// setInterval(() => {
// 	var Bittrex = new Exchanges.bittrex
// 	Bittrex.refreshMarkets()
// }, 10000)

helpers.updateBitcoinValue()

var Bittrex = new Exchanges.bittrex
var Binance = new Exchanges.binance
var Kucoin = new Exchanges.kucoin
var Coinexchange = new Exchanges.coinExchange

setInterval(() => {
	Bittrex.refreshFeeds()
	Binance.refreshFeeds()
	Kucoin.refreshTicker()
	Coinexchange.refreshFeeds()
	algo();
}, config.frequentChangeInterval * 5000)

setInterval(() => {
	Bittrex.refreshCoins()
	// Binance.refreshCoins()
	Coinexchange.refreshCoins()
	Kucoin.refreshCoins()
}, config.frequentChangeInterval * 5000)


