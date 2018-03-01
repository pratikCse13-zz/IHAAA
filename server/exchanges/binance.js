/**
 * import npm modules
 */
var request = require('request-promise')
var Promise = require('bluebird')
var reload = require('require-reload')(require)
var fs = require('fs')

/**
 * import package modules
 */
var ExchangeType1 = require('../exchangeTypes/exchangeType1.js')
var Feed = require('../feed')
var helpers = require('../helpers')
var constants = require('../constants')
var redis = require('../redisSetup')
var redisKeyPersist = require('./redisKeyPersistanceSetup')
var coinPersist = require('./coinInfoPersistanceSetup')

class Binance extends ExchangeType1{
	constructor(){
		super()
		
		this.exchange = 'binance'
		this.filePath = __dirname
		this.redisKeyPersist = redisKeyPersist(constants.STRINGS.binance)
		this.coinPersist = coinPersist(constants.STRINGS.binance)
		this.txMakerFee = 0.0025
		this.txTakerFee = 0.0025
		this.depositFee = 0

		this.marketField = 'symbol'
		this.marketCoinField = 'baseAsset'
		this.baseCoinField = 'quoteAsset'
		this.marketIsActiveField = 'status'
		this.api1ResultSubKey = 'symbols'
		this.marketsApi = 'https://www.binance.com/api/v1/exchangeInfo'
		
		this.dollarVolumeField = 'volume'
		this.lastPriceField = 'lastPrice'
		this.btcVolumeField = 'quoteVolume'
		this.bidPriceField = 'bidPrice'
		this.askPriceField = 'askPrice'
		this.api2ResultSubKey = ''
		this.marketSummariesApi = 'https://www.binance.com/api/v1/ticker/24hr'
		
		this.marketCoinApi2Field = 'Currency'
		this.coinWithdrawActiveField = 'status'
		this.coinDepositActiveField = 'status'
		this.noticeField = 'msg'
		this.api3ResultSubKey = ''
		this.coinsApi = 'https://www.binance.com/wapi/v3/systemStatus.html'
		
		this.buyKey = 'bids'
		this.sellKey = 'asks'
		this.quantityKey = '1'
		this.rateKey = '0'
		this.parameterKey = ''
		this.orderBookApi = 'https://www.binance.com/api/v1/depth?symbol=||&limit=20'

		//not available
		this.withdrawFeeField = 'TxFee'
		this.marketCoinLongField = 'baseAsset'
		this.baseCoinLongField = 'quoteAsset'
	}

	getMarkets(){
		return reload('markets.json')
	}

	async refreshMarkets(){
		super.refreshMarkets.call(this);
	}

	async refreshFeeds(){
		super.refreshFeeds.call(this);
	}

	async refreshCoins(){
		super.refreshCoins.call(this);
	}
}

module.exports = Binance