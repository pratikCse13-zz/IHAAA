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

/** 
 * this exchange type has first API providing the markets/products
 * the nwe take the id from these markets and call the second api to get all the prices
*/
class ExchangeType5{
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
		// fs.writeFileSync(this.filePath+'/markets.json', JSON.stringify(markets, null, 4))

		markets.forEach(market => {
			//get the market name from market currency and base currency
			var marketName = helpers.getMarketName(market[this.marketCoinField], market[this.baseCoinField])
			//generate the generalised redis key based on exchange and market name
			var key = helpers.getRedisKeyForMarketFeed(this.exchange, marketName)
			//get the formatted information from the API results
			var marketCoin = helpers.getMarketCurrency(market[this.marketCoinField])
			var baseCoin = helpers.getBaseCurrency(market[this.baseCoinField])
			var marketCoinLong = helpers.getMarketCurrency(market[this.marketCoinLongField])
			var baseCoinLong = helpers.getBaseCurrency(market[this.baseCoinLongField])

			var bidPrice = helpers.getFormattedPrice(market[this.bidPriceField])
			var askPrice = helpers.getFormattedPrice(market[this.askPriceField])
			var lastPrice = helpers.getFormattedPrice(market[this.lastPriceField])

			var btcVolume
			if(baseCoin == constants.STRINGS.bitcoinShortNotation) {
				btcVolume = helpers.getFormattedVolume(market[this.btcVolumeField])
			} else {
				btcVolume = helpers.getBtcVolume(market[this.btcVolumeField], baseCoin, this.exchange)
			}
			var dollarVolume = helpers.getDollarVolume(btcVolume)

			//add the new base coin to the array of basecoins for this exchange
			helpers.recordNewBaseCoin(this.exchange, baseCoin)

			//if this marketCoin has a market in this exchange then save the last price of its btc market
			if(key){
				var marketName = key.split('|')[1]
				var temp = marketName.split('/')
				var marketCoin = temp[0]
				var baseCoin = temp[1]
				if(global[this.exchange+'BaseCoins'].indexOf(marketCoin) != -1 && baseCoin == constants.STRINGS.bitcoinShortNotation){
					global[this.exchange+'-'+marketCoin] = lastPrice
				}
			}

			//set the market related info to redis
			redis.hmset(key, 
				'exchange', this.exchange,
				'marketCoin', marketCoin, 
				'baseCoin', baseCoin, 
				'marketCoinLong', marketCoinLong, 
				'baseCoinLong', baseCoinLong,
				'market', marketName,
				'dollarVolume', dollarVolume, 
				'lastPrice', lastPrice, 
				'btcVolume', btcVolume, 
				'bidPrice', bidPrice,
				'askPrice', askPrice,
				'timestamp', helpers.getTimestamp(),
				'marketIsActive', helpers.getMarketIsActive(market[this.marketIsActiveField])
			)
		})
		console.timeEnd(`${this.exchange}'s Markets`)
		console.log(`${this.exchange}'s markets refreshed.`)		
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

module.exports = ExchangeType5