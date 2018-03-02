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
const config = require('../config')
var redis = require('../redisSetup')
var redisKeyPersist = require('./redisKeyPersistanceSetup')
var coinPersist = require('./coinInfoPersistanceSetup')

class Bittrex extends ExchangeType1{
	constructor(){
		super()
		
		this.exchange = 'bittrex'
		this.filePath = __dirname
		this.redisKeyPersist = redisKeyPersist(constants.STRINGS.bittrex)
		this.coinPersist = coinPersist(constants.STRINGS.bittrex)
		this.txMakerFee = 0.0025
		this.txTakerFee = 0.0025
		this.depositFee = 0

		this.marketField = 'MarketName'
		this.marketCoinField = 'MarketCurrency'
		this.marketCoinLongField = 'MarketCurrencyLong'
		this.baseCoinField = 'BaseCurrency'
		this.baseCoinLongField = 'BaseCurrencyLong'
		this.marketIsActiveField = 'IsActive'
		this.api1ResultSubKey = 'result'
		this.marketsApi = 'https://bittrex.com/api/v1.1/public/getmarkets'

		this.dollarVolumeField = 'Volume'
		this.lastPriceField = 'Last'
		this.btcVolumeField = 'BaseVolume'
		this.bidPriceField = 'Bid'
		this.askPriceField = 'Ask'
		this.api2ResultSubKey = 'result'
		this.marketSummariesApi = 'https://bittrex.com/api/v1.1/public/getmarketsummaries'
		
		this.marketCoinApi2Field = 'Currency'
		this.withdrawFeeField = 'TxFee'
		this.coinWithdrawActiveField = 'IsActive'
		this.coinDepositActiveField = 'IsActive'
		this.noticeField = 'Notice'
		this.api3ResultSubKey = 'result'
		this.coinsApi = 'https://bittrex.com/api/v1.1/public/getcurrencies'
	
		this.buyKey = 'result.buy'
		this.sellKey = 'result.sell'
		this.quantityKey = 'Quantity'
		this.rateKey = 'Rate'
		this.parameterField = 'MarketName'
		this.orderBookApi = 'https://bittrex.com/api/v1.1/public/getorderbook?market=||&type=both'
	}

	getMarkets(){
		return reload('markets.json')
	}

	async refreshMarkets(){
		super.refreshMarkets.call(this)
	}

	async refreshFeeds(){
		super.refreshFeeds.call(this)
	}

	async refreshCoins(){
		super.refreshCoins.call(this)
	}
}

module.exports = Bittrex