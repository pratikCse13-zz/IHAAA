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
var redis = require('../redisSetup');
var helpers = require('../helpers')
var constants = require('../constants')

class ExchangeType4{
	constructor(){}

	async refreshMarkets(){
		console.log(`Refreshing ${this.exchange}'s markets.`)
		console.time(`${this.exchange}'s Markets`);
		//options to make API call to get market details
		var options = {
			uri: this.marketsApi,
			json: true // Automatically parses the JSON string in the response
		}
		try {
			var markets = await request.get(options)
			if(this.api1ResultSubKey != ''){
				markets = markets[this.api1ResultSubKey]
			}
		} catch(err) {
			return helpers.handleError(err, 'fetching markets', `${this.exchange}`)
		}
		//save the markets to the json file
		fs.writeFileSync(this.filePath+`/${this.exchange}-markets.json`, JSON.stringify(markets, null, 4))

		markets.forEach(market => {
			//get the market name from market currency and base currency
			var marketName = helpers.getMarketName(market[this.marketCoinField], market[this.baseCoinField])
			//generate the generalised redis key based on exchange and market name
			var key = helpers.getRedisKeyForMarketFeed(this.exchange, marketName)
			//persist the redis key against the unprocessed market name of the APi feed.
			//this unprocessed market name acts as the primary key across different APIs of the exchange
			this.redisKeyPersist.setItemSync(market[this.marketField], key)
			//get the formatted information from the API results
			var marketCoin = helpers.getMarketCurrency(market[this.marketCoinField])
			var baseCoin = helpers.getBaseCurrency(market[this.baseCoinField])

			//add the new base coin to the array of basecoins for this exchange
			helpers.recordNewBaseCoin(this.exchange, baseCoin)

			var marketCoinLong = helpers.getMarketCurrencyLong(market[this.marketCoinLongField])
			var baseCoinLong = helpers.getBaseCurrencyLong(market[this.baseCoinLongField])
			//set the market related info to redis
			redis.hmset(key, 
				'exchange', this.exchange,
				'marketCoin', marketCoin, 
				'baseCoin', baseCoin, 
				'marketCoinLong', marketCoinLong, 
				'baseCoinLong', baseCoinLong,
				'market', marketName,
				'marketIsActive', helpers.getMarketIsActive(market[this.marketIsActiveField])
			)
		})
		console.timeEnd(`${this.exchange}'s Markets`)
		console.log(`${this.exchange}'s markets refreshed.`)		
	}

	async refreshFeeds(){
		console.log(`Refreshing ${this.exchange}'s feeds.`)
		console.time(`${this.exchange}'s Feeds`);
		//refresh markets first 
		this.refreshMarkets();
		//options to make the API call
		var options = {
			uri: this.marketSummariesApi,
			json: true // Automatically parses the JSON string in the response
		}
		//make the API call
		try {
			var marketSummaries = await request.get(options)
			if(this.api2ResultSubKey != ''){
				marketSummaries = marketSummaries[this.api2ResultSubKey]
			}
		} catch(err) {
			helpers.handleError(err, 'fetching market summaries', `${this.exchange}`)
		}
		
		marketSummaries.forEach(function marketSummariesIterator(market){
			//get the redis key(created from exchange-name and market-name) from persisted key storage 
			//stored against the unprocessed market name in the feeds
			var redisKey = this.redisKeyPersist.getItemSync(market[this.marketField])

			//format data that needs to be saved
			// var dollarVolume = helpers.getFormattedVolume(market[this.dollarVolumeField])
			var lastPrice = helpers.getFormattedPrice(market[this.lastPriceField])
			// var btcVolume = helpers.getFormattedVolume(market[this.btcVolumeField])
			var bidPrice = helpers.getFormattedPrice(market[this.bidPriceField])
			var askPrice = helpers.getFormattedPrice(market[this.askPriceField])

			//if this marketCoin has a market in this exchange then save the last price of its btc market
			if(redisKey){
				var marketName = redisKey.split('|')[1]
				var temp = marketName.split('/')
				var marketCoin = temp[0]
				var baseCoin = temp[1]
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
			}

			//set the market summaries into redis
			redis.hmset(redisKey, 
				'dollarVolume', dollarVolume, 
				'lastPrice', lastPrice, 
				'btcVolume', btcVolume, 
				'bidPrice', bidPrice,
				'askPrice', askPrice,
				'timestamp', helpers.getTimestamp()
			)
		}.bind(this))
		console.timeEnd(`${this.exchange}'s Feeds`)
		console.log(`${this.exchange}'s feeds refreshed.`)		
	}

	async refreshCoins(){
		console.log(`Refreshing ${this.exchange}'s Currencies.`)
		console.time(` ${this.exchange}'s Currencies`)
		//options to make the API call
		var options = {
			uri: this.coinsApi,
			json: true // Automatically parses the JSON string in the response
		}
		//make the API call
		try {
			var coins = await request.get(options)
			if(this.api3ResultSubKey != ''){
				coins = coins[this.api3ResultSubKey]
			}
		} catch(err) {
			helpers.handleError(err, 'fetching coins', 'Bittrex')
		}
		
		coins.forEach(function coinsIterator(currency){
			//format the raw to a savable format
			var marketCoinApi2 = helpers.getMarketCurrency(currency[this.marketCoinApi2Field])
			var withdrawFee = helpers.getFormattedValue(currency[this.withdrawFeeField])
			var coinWithdrawActive = helpers.getCoinIsActive(currency[this.coinWithdrawActiveField])
			var coinDepositActive = helpers.getCoinIsActive(currency[this.coinDepositActiveField])
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

module.exports = ExchangeType4