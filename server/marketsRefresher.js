/**
 * npm modules import
 */
var bodyParser = require('body-parser')
var request = require('request-promise')
var fs = require('fs')
require('babel-polyfill')
var bluebird = require('bluebird')

/**
 * import project modules
 */
var helpers = require('./helpers')
var Exchanges = require('./exchanges')
var config = require('./config.js')
var algo = require('./algo.js')
require('./depthCalculator.js')


helpers.updateCoinDollarValue()
//refresh coin values in dollars
setInterval(()=>{
	helpers.updateCoinDollarValue()
}, 60*1000)

var Bittrex = new Exchanges.bittrex
var Binance = new Exchanges.binance
var Kucoin = new Exchanges.kucoin
var Coinexchange = new Exchanges.coinExchange
var Quoinex = new Exchanges.quoinex
var Qryptos = new Exchanges.qryptos
var Gdax = new Exchanges.gdax
var Tidex = new Exchanges.tidex
var Cex = new Exchanges.cex
// var Bitfinex = new Exchanges.bitfinex

setInterval(() => {
	Bittrex.refreshFeeds()
	// Bitfinex.refreshFeeds()
	//Binance.refreshFeeds()
	Kucoin.refreshTicker()
	Coinexchange.refreshFeeds()
	// Gdax.refreshFeeds()
	Tidex.refreshFeeds()
	Cex.refreshFeeds()
	//Quoinex.refreshMarkets()
	//Qryptos.refreshMarkets()
	algo();
}, config.frequentChangeInterval * 1000)

setInterval(() => {
	// Bittrex.refreshCoins()
	// Bitfinex.refreshCoins()
	// Binance.refreshCoins()
	// Coinexchange.refreshCoins()
	// Kucoin.refreshCoins()
}, config.frequentChangeInterval * 1000)


