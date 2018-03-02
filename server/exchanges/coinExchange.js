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

class Coinexchange extends ExchangeType1{
	constructor(){
		super()
		
		this.exchange = 'coinexchange'
		this.filePath = __dirname
		this.redisKeyPersist = redisKeyPersist(constants.STRINGS.coinExchange)
		this.coinPersist = coinPersist(constants.STRINGS.coinExchange)
		this.txMakerFee = 0.0025
		this.txTakerFee = 0.0025
		this.depositFee = 0

		this.marketField = 'MarketID'
		this.marketCoinField = 'MarketAssetCode'
		this.marketCoinLongField = 'MarketAssetName'
		this.baseCoinField = 'BaseCurrencyCode'
		this.baseCoinLongField = 'BaseCurrency'
		this.marketIsActiveField = 'Active'
		this.api1ResultSubKey = 'result'
		this.marketsApi = 'https://www.coinexchange.io/api/v1/getmarkets'

		this.lastPriceField = 'LastPrice'
		this.btcVolumeField = 'BTCVolume'
		this.bidPriceField = 'BidPrice'
		this.askPriceField = 'AskPrice'
		this.api2ResultSubKey = 'result'
		this.marketSummariesApi = 'https://www.coinexchange.io/api/v1/getmarketsummaries'
		
		this.marketCoinApi2Field = 'TickerCode'
		this.coinWithdrawActiveField = 'WalletStatus'
		this.coinDepositActiveField = 'WalletStatus'
		this.noticeField = 'Notice'
		this.api3ResultSubKey = 'result'
		this.parameterField = 'MarketID'
		this.coinsApi = 'https://www.coinexchange.io/api/v1/getcurrencies'
		
		this.buyKey = 'result.BuyOrders'
		this.sellKey = 'result.SellOrders'
		this.quantityKey = 'Quantity'
		this.rateKey = 'Price'
		this.orderBookApi = 'https://www.coinexchange.io/api/v1/getorderbook?market_id=||'

		//not available
		this.dollarVolumeField = 'Volume'
		this.withdrawFeeField = 'TxFee'
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

module.exports = Coinexchange