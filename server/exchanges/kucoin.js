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
var ExchangeType2 = require('../exchangeTypes/exchangeType2.js')
var Feed = require('../feed')
var helpers = require('../helpers')
var constants = require('../constants')
var redis = require('../redisSetup')
var coinPersist = require('./coinInfoPersistanceSetup')

class Kucoin extends ExchangeType2{
	constructor(){
		super()
		
		this.exchange = 'kucoin'
		this.filePath = __dirname
		
		//this is not required 
		// this.redisKeyPersist = redisKeyPersist
		
		this.coinPersist = coinPersist(constants.STRINGS.kucoin)
		this.depositFee = 0

		this.marketField = 'symbol'
		this.marketCoinField = 'coinType'
		this.baseCoinField = 'coinTypePair'
		this.marketIsActiveField = 'trading'
		this.lastPriceField = 'lastDealPrice';
		this.btcVolumeField = 'volValue';
		this.taxMakerFeeField = 'feeRate';
		this.taxTakerFeeField = 'feeRate';
		this.bidPriceField = 'buy';
		this.askPriceField = 'sell';
		this.tickerApi = 'https://api.kucoin.com/v1/open/tick'
		
		
		this.marketCoinApi2Field = 'coin'
		this.withdrawFeeField = 'withdrawFeeRate'
		this.coinWithdrawActiveField = 'enableWithdraw'
		this.coinDepositActiveField = 'enableDeposit'
		this.coinsApi = 'https://api.kucoin.com/v1/market/open/coins'
	
		this.buyKey = 'data.BUY'
		this.sellKey = 'data.SELL'
		this.quantityKey = '1'
		this.rateKey = '0'
		this.parameterField = 'symbol'
		this.orderBookApi = 'https://api.kucoin.com/v1/||/open/orders?limit=20'

		//not available
		this.dollarVolumeField = 'Volume';
		this.baseCoinLongField = 'BaseCurrencyLong'
		this.marketCoinLongField = '....'
		this.noticeField = 'notice'
	}

	getMarkets(){
		return reload('markets.json')
	}

	getTickerApi(){
		return this.tickerApi
	}

	getCoinsApi(){
		return this.coinsApi
	}

	async refreshTicker(){
		super.refreshTicker.call(this);
	}

	async refreshCoins(){
		super.refreshCoins.call(this);
	}
}

module.exports = Kucoin