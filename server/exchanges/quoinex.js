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
var ExchangeType3 = require('../exchangeTypes/exchangeType3.js')
var Feed = require('../feed')
var helpers = require('../helpers')
var constants = require('../constants')
var redis = require('../redisSetup')
var coinPersist = require('./coinInfoPersistanceSetup')

class Quoinex extends ExchangeType3{
	constructor(){
		super()
		
		this.exchange = 'quoinex'
		this.filePath = __dirname
		
		//this is not required 
		// this.redisKeyPersist = redisKeyPersist
		// this.coinPersist = coinPersist(constants.STRINGS.kucoin)
		this.api1ResultSubKey = ''		

		this.depositFee = 0

		this.marketField = 'currency_pair_code'
		this.marketCoinField = 'base_currency'
		this.baseCoinField = 'quoted_currency'
		this.marketIsActiveField = 'disabled'
		this.lastPriceField = 'last_traded_price';
		this.btcVolumeField = 'volume_24h';
		this.taxMakerFeeField = 'taker_fee';
		this.taxTakerFeeField = 'maker_fee';
		this.bidPriceField = 'market_bid';
		this.askPriceField = 'market_ask';
		this.marketsApi = 'https://api.quoine.com/products'
		this.baseCoinLongField = 'quoted_cuurency'
		this.marketCoinLongField = 'base_currency'
		
		//not available
		this.withdrawFeeField = 'withdrawFeeRate'
		this.coinWithdrawActiveField = 'enableWithdraw'
		this.coinDepositActiveField = 'enableDeposit'
		this.dollarVolumeField = 'Volume';
		this.noticeField = ''
	}

	getMarkets(){
		return reload('markets.json')
	}

	async refreshMarkets(){
		super.refreshMarkets.call(this);
	}
}

module.exports = Quoinex