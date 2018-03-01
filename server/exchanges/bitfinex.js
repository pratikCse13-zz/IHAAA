// /**
//  * import npm modules
//  */
// var request = require('request-promise')
// var Promise = require('bluebird')
// var reload = require('require-reload')(require)
// var fs = require('fs')

// /**
//  * import package modules
//  */
// var Feed = require('../feed')
// var helpers = require('../helpers')
// var constants = require('../constants')
// var redis = require('../redisSetup')
// var redisKeyPersist = require('./redisKeyPersistanceSetup')
// var coinPersist = require('./coinInfoPersistanceSetup')

// class Bitfinex{
// 	constructor(){
// 		super()
		
// 		this.exchange = 'bitfinex'
// 		this.filePath = __dirname
// 		this.redisKeyPersist = redisKeyPersist(constants.STRINGS.bitfinex)
// 		this.coinPersist = coinPersist(constants.STRINGS.bitfinex)
// 		this.txMakerFee = 0.0025
// 		this.txTakerFee = 0.0025
// 		this.depositFee = 0

// 		this.marketField = 'SYMBOL'
// 		this.marketCoinField = ''
// 		this.baseCoinField = ''
// 		this.marketIsActiveField = ''
// 		this.api1ResultSubKey = ''
// 		this.marketsApi = 'https://api.bitfinex.com/v1/symbols'
		
// 		this.dollarVolumeField = 'volume'
// 		this.lastPriceField = 'LAST_PRICE'
// 		this.btcVolumeField = 'VOLUME'
// 		this.bidPriceField = 'BID'
// 		this.askPriceField = 'ASK'
// 		this.api2ResultSubKey = ''
// 		this.marketSummariesApi = 'https://api.bitfinex.com/v2/tickers'
		
// 		this.marketCoinApi2Field = 'Currency'
// 		this.coinWithdrawActiveField = 'status'
// 		this.coinDepositActiveField = 'status'
// 		this.noticeField = 'msg'
// 		this.api3ResultSubKey = ''
// 		this.coinsApi = 'https://api.bitfinex.com/v2/platform/status'
		
// 		//not available
// 		this.withdrawFeeField = 'TxFee'
// 		this.marketCoinLongField = 'baseAsset'
// 		this.baseCoinLongField = 'quoteAsset'
// 	}

// 	getMarkets(){
// 		return reload('markets.json')
// 	}

// 	async refreshMarkets(){
// 		super.refreshMarkets.call(this);
// 	}

// 	async refreshFeeds(){
// 		//fetch all the markets
// 		var options = {
// 			uri: this.marketsApi,
// 			json: true
// 		}
// 		try {
// 			var marketData = await request.get(options)
// 		} catch(err) {
// 			return helpers.handleError(err, 'fetching markets', `${this.exchange}`)
// 		}
// 		var markets = marketData[this.marketsApiResultSubKey]
// 		//then for each market fetch the ticket 
// 		markets.forEach(async (market)=>{
//             //get market ticker
// 			var options = {
// 				uri: this.tickerApi.replace(/||/g, market.id),
// 				json: true
// 			}
// 			try {
// 				var tickerData = await request.get(options)
// 			} catch(err) {
// 				return helpers.handleError(err, 'fetching market tickers', `${this.exchange}`)
// 			}
//             ticker = tickerData[this.ticketApiResultSubKey]

//             //timestamp 
//             var timestamp = helpers.getTimestamp()
//             //get formatted market name
// 			var marketName = helpers.getMarketName(market[this.marketCoin], market[this.baseCoin])
//             //get redis key
//             var redisKey = helpers.getRedisKeyForMarketFeed(this.exchange, market)
//             //market coin long
//             var marketCoinLong = helpers.getMarketCurrencyLong(market[this.marketCoinLong])
//             //base coin long
//             var baseCoinLong = helpers.getBaseCurrencyLong(market[this.baseCoin])
//             //base coin 
//             var baseCoin = helpers.getBaseCurrency(market[this.baseCoin])
//             //market coin
//             var marketCoin = helpers.getMarketCurrency(market[this.marketCoin])
//             //market is active
//             var marketIsActive = helpers.getMarketIsActive(market[this.marketIsActive])
//             //askPrice
//             var askPrice = helpers.getFormattedPrice(ticker[this.askPrice])
//             //bidPrice
//             var bidPrice = helpers.getFormattedPrice(ticker[this.bidPrice])
//             //lastPrice
// 			var lastPrice = helpers.getFormattedPrice(ticker[this.lastPrice])

// 			if(redisKey){
//                 //if this shitCoin has a market with it being base coin in this exchange then save the last price of its btc market
//                 //this is required for calculation of btc volume
// 				var temp = marketName.split('/')
// 				var marketCoin = temp[0]
// 				var baseCoin = temp[1]
// 				if(global[this.exchange+'BaseCoins'].indexOf(marketCoin) != -1 && baseCoin == constants.STRINGS.bitcoinShortNotation){ //needs dictionary
// 					global[this.exchange+'-'+marketCoin] = lastPrice
// 				}
//             }

//             if(redisKey){
//                 var btcVolume
//                 //needs dictionary
// 				if(baseCoin == constants.STRINGS.bitcoinShortNotation) {
// 					btcVolume = helpers.getFormattedVolume(market[this.btcVolumeField])
// 				} else {
// 					btcVolume = helpers.getBtcVolume(market[this.btcVolumeField], baseCoin, this.exchange)
// 				}
// 				var dollarVolume = helpers.getDollarVolume(btcVolume)
//             }

			
// 			if(redisKey){
//                 redis.hmset(redisKey, 
//                     'exchange', this.exchange,
//                     'marketCoin', marketCoin, 
//                     'baseCoin', baseCoin, 
//                     'marketCoinLong', marketCoinLong, 
//                     'baseCoinLong', baseCoinLong,
//                     'market', marketName,
//                     'marketIsActive', helpers.getMarketIsActive(market[this.marketIsActiveField]),
//                     'buyKey', this.buyKey,
//                     'sellKey', this.sellKey,
//                     'quantityKey', this.quantityKey,
//                     'rateKey', this.rateKey,
//                     'parameterField', this.parameterField,
//                     'orderBookApi', this.orderBookApi.replace('||', market[this.parameterField]),
//                     'dollarVolume', dollarVolume, 
//                     'lastPrice', lastPrice, 
//                     'btcVolume', btcVolume, 
//                     'bidPrice', bidPrice,
//                     'askPrice', askPrice,
//                     'timestamp', timestamp
//                 )
// 			}
// 		})
// 		//save them to redis
// 	}

// 	async refreshCoins(){
// 		super.refreshCoins.call(this);
// 	}
// }

// module.exports = Bitfinex