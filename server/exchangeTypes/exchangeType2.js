/**
 * npm modules import
 */
var request = require('request-promise')
var Promise = require('bluebird')
var reload = require('require-reload')(require)
var fs = require('fs')

/**
 * project modules import
 */
var redis = require('../redisSetup')
var helpers = require('../helpers')
var constants = require('../constants')

class ExchangeType2{
	constructor(){}

	async refreshTicker(){
		console.log(`Refreshing ${this.exchange}'s markets.`)
		console.time(`${this.exchange}'s Markets`);
		//options to make API call to get market details
		var options = {
			uri: this.getTickerApi(),
			json: true // Automatically parses the JSON string in the response
		}
		try {
			var markets = await request.get(options)
			markets = markets.data
		} catch(err) {
			return helpers.handleError(err, 'fetching markets', `${this.exchange}`)
		}
		//save the markets to the json file
		console.log(fs.writeFileSync(this.filePath+`/${this.exchange}-markets.json`, JSON.stringify(markets, null, 4)))

		markets.forEach(function marketIterator(market){
			//get the market name from market currency and base currency
			var marketName = helpers.getMarketName(market[this.marketCoinField], market[this.baseCoinField])
			//generate the generalised redis key based on exchange and market name
			var key = helpers.getRedisKeyForMarketFeed(this.exchange, marketName)
			
			//***** this is not required as there is not connection between the two APIs of kucoin */
			//persist the redis key against the unprocessed market name of the APi feed.
			//this unprocessed market name acts as the primary key across different APIs of the exchange
			//this.redisKeyPersist.setItemSync(market[this.marketField], key)
			
			//get the formatted information from the API results
			var marketCoin = helpers.getMarketCurrency(market[this.marketCoinField])
			var baseCoin = helpers.getBaseCurrency(market[this.baseCoinField])

			//add the new base coin to the array of basecoins for this exchange
			helpers.recordNewBaseCoin(this.exchange, baseCoin)

			var bidPrice = helpers.getFormattedPrice(market[this.bidPriceField])
			var askPrice = helpers.getFormattedPrice(market[this.askPriceField])
			var lastPrice = helpers.getFormattedPrice(market[this.lastPriceField])

			//if this marketCoin has a market in this exchange then save the last price of its btc market
			if(global[this.exchange+'BaseCoins'].indexOf(marketCoin) != -1 && baseCoin == constants.STRINGS.bitcoinShortNotation){
				global[this.exchange+'-'+marketCoin] = lastPrice
			}

			var btcVolume
			if(baseCoin == constants.STRINGS.bitcoinShortNotation) {
				btcVolume = helpers.getFormattedVolume(market[this.btcVolumeField])
			} else {
				btcVolume = helpers.getBtcVolume(market[this.btcVolumeField], baseCoin, this.exchange)
			}
			var dollarVolume = helpers.getDollarVolume(btcVolume)
			
			//TODO - put appropriate values
			var marketCoinLong = helpers.getMarketCurrencyLong(market[this.marketCoinField])
			var baseCoinLong = helpers.getBaseCurrencyLong(market[this.baseCoinField])
			
			//set the market related info to redis
			redis.hmset(key, 
				'exchange', this.exchange,
				'marketCoin', marketCoin, 
				'baseCoin', baseCoin, 
				'marketCoinLong', marketCoinLong, 
				'baseCoinLong', baseCoinLong,
				'market', marketName,
				'bidPrice', bidPrice,
				'askPrice', askPrice,
				'lastPrice', lastPrice, 	
				'dollarVolume', dollarVolume, 
				'btcVolume', btcVolume, 		
				'timestamp', helpers.getTimestamp(),	
				'marketIsActive', helpers.getMarketIsActive(market[this.marketIsActiveField])
			)
		}.bind(this))
		console.timeEnd(`${this.exchange}'s Markets`)
		console.log(`${this.exchange}'s markets refreshed.`)		
	}

	async refreshCoins(){
		console.log(`Refreshing ${this.exchange}'s Currencies.`)
		console.time(` ${this.exchange}'s Currencies`)
		//options to make the API call
		var options = {
			uri: this.getCoinsApi(),
			json: true // Automatically parses the JSON string in the response
		}
		//make the API call
		try {
			var coins = await request.get(options)
			coins = coins.data
		} catch(err) {
			helpers.handleError(err, 'fetching coins', 'Bittrex')
		}
		
		coins.forEach(function coinsIterator(currency){
			//format the raw to a savable format
			var marketCoinApi2 = helpers.getMarketCurrency(currency[this.marketCoinApi2Field])
			var withdrawFee = helpers.getFormattedValue(currency[this.withdrawFeeField])
			var coinWithdrawActive = helpers.getCoinIsActive(currency[this.coinWithdrawActiveField])
			var coinDepositActive = helpers.getCoinIsActive(currency[this.coinDepositActiveField])
			
			//TODO: set proper value
			var notice = helpers.reduceString(currency[this.noticeField])

			var redisKey = helpers.getRedisKeyForCoinData(this.exchange, marketCoinApi2)

			//persist the data about currencies to a file based storage
			redis.hmset(redisKey, 
				'exchange', this.exchange,
				'withdrawFee', withdrawFee,
				'depositFee', this.depositFee,
				'coinWithdrawActive', coinWithdrawActive,
				'coinDepositActive', coinDepositActive,
				'notice', notice
			);
		}.bind(this))
		console.timeEnd(`${this.exchange}'s Currencies`)
		console.log(`${this.exchange}'s currencies refreshed.`)		
	}
}

module.exports = ExchangeType2