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
var Feed = require('../feed')
var helpers = require('../helpers')
var constants = require('../constants')
var redis = require('../redisSetup')
var redisKeyPersist = require('./redisKeyPersistanceSetup')
var coinPersist = require('./coinInfoPersistanceSetup')

class Cryptopia {
	constructor(){
		this.exchange = 'cryptopia'
		this.filePath = __dirname
		this.redisKeyPersist = redisKeyPersist(constants.STRINGS.cryptopia)
		this.coinPersist = coinPersist(constants.STRINGS.cryptopia)
		this.txMakerFee = 0.0025
		this.txTakerFee = 0.0025
		this.depositFee = 0
        
		this.market = 'Label'
		this.marketCoin = 'Symbol'
		this.marketCoinLong = 'Currency'
		this.baseCoin = 'BaseSymbol'
		this.baseCoinLong = 'BaseCurrency'
		this.marketIsActive = 'status'
		this.marketsApi = 'https://www.cryptopia.co.nz/api/GetTradePairs'
		
		this.lastPrice = 'LastPrice'
		this.btcVolume = 'BaseVolume'
		this.bidPrice = 'BidPrice'
		this.askPrice = 'AskPrice'
		this.ticketApiResultSubKey = 'Data'		
		this.tickerApi = 'https://www.cryptopia.co.nz/api/GetMarkets'
		
		this.marketCoinApi2Field = 'id'
		this.coinWithdrawActiveField = 'status'
		this.coinDepositActiveField = 'status'
		this.api3ResultSubKey = ''
        this.coinsApi = 'https://api.gdax.com/currencies'
        
        this.buyKey = 'Data.Buy'
		this.sellKey = 'Data.Sell'
		this.quantityKey = 'Volume'
		this.rateKey = 'Price'
		this.parameterField = 'id'
		this.orderBookApi = 'https://www.cryptopia.co.nz/api/GetMarketOrders/||/20'
		
		//not available
		this.notice = 'status_message'
		this.marketsApiResultSubKey = 'pairs'
		this.withdrawFeeField = 'TxFee'
	}

	getMarkets(){
		return reload('markets.json')
	}

	async refreshFeeds(){
		console.log(`Refreshing ${this.exchange}'s markets.`)
		console.time(`${this.exchange}'s Markets`)
		//fetch all the markets
		var options1 = {
			uri: this.marketsApi,
			json: true
        }
        var options2 = {
			uri: this.tickerApi,
			json: true
		}
		try {
			var [markets, tickers] = await Promise.all([
                request.get(options1),
                request.get(options2)
            ])
		} catch(err) {
			return helpers.handleError(err, 'fetching markets', `${this.exchange}`)
		}
        var marketNames = Object.keys(marketNames.pairs)
        var marketsString = ''
		//then generat the ticker api
		marketNames.forEach((marketName)=>{
            if(marketsString == ''){
                marketsString = marketName
            } else {
                marketsString += '-'+marketName
            }
		})
		//get markets ticker
        var options = {
            uri: this.tickerApi.replace(/\|\|/g, marketsString),
            json: true
        }
        try {
            var tickerData = await request.get(options)
        } catch(err) {
            return helpers.handleError(err, 'fetching market tickers', `${this.exchange}`)
        }
        //iterate and save to redis
        Object.entries(tickerData).forEach(([key, ticker])=>{
            //timestamp 
            var timestamp = helpers.getTimestamp()
            //market coin long
            var marketCoinLong = helpers.getMarketCurrencyLong(key.split('_')[0])
            //base coin long
            var baseCoinLong = helpers.getBaseCurrencyLong(key.split('_')[1])
            //base coin 
            var baseCoin = helpers.getBaseCurrency(key.split('_')[1])
            //market coin
            var marketCoin = helpers.getMarketCurrency(key.split('_')[0])
            //get formatted market name
			var marketName = helpers.getMarketName(marketCoin, baseCoin)
            //get redis key
            var redisKey = helpers.getRedisKeyForMarketFeed(this.exchange, marketName)
            //market is active
            var marketIsActive = true
            //askPrice
            var askPrice = helpers.getFormattedPrice(ticker[this.askPrice])
            //bidPrice
            var bidPrice = helpers.getFormattedPrice(ticker[this.bidPrice])
            //lastPrice
			var lastPrice = helpers.getFormattedPrice(ticker[this.lastPrice])

			if(redisKey){
                //if this shitCoin has a market with it being base coin in this exchange then save the last price of its btc market
                //this is required for calculation of btc volume
				var temp = marketName.split('/')
				var marketCoin = temp[0]
				var baseCoin = temp[1]
				if(!global[this.exchange+'BaseCoins']){
					global[this.exchange+'BaseCoins'] = []
				}
				if(global[this.exchange+'BaseCoins'].indexOf(marketCoin) != -1 && baseCoin == constants.STRINGS.bitcoinShortNotation){ //needs dictionary
					global[this.exchange+'-'+marketCoin] = lastPrice
				}
            }

            if(redisKey){
                var btcVolume
                //needs dictionary
				if(baseCoin == constants.STRINGS.bitcoinShortNotation) {
					btcVolume = helpers.getFormattedVolume(ticker[this.btcVolume])
				} else {
					btcVolume = helpers.getBtcVolume(ticker[this.btcVolume], baseCoin, this.exchange)
				}
				var dollarVolume = helpers.getDollarVolume(btcVolume)
            }

			
			if(redisKey){
                redis.hmset(redisKey, 
                    'exchange', this.exchange,
                    'marketCoin', marketCoin, 
                    'baseCoin', baseCoin, 
                    'marketCoinLong', marketCoinLong, 
                    'baseCoinLong', baseCoinLong,
                    'market', marketName,
                    'marketIsActive', true,
                    'buyKey', key+'.'+this.buyKey,
                    'sellKey', key+'.'+this.sellKey,
                    'quantityKey', this.quantityKey,
                    'rateKey', this.rateKey,
                    'parameterField', this.parameterField,
                    'orderBookApi', this.orderBookApi.replace(/\|\|/g, key),
                    'dollarVolume', dollarVolume, 
                    'lastPrice', lastPrice, 
                    'btcVolume', btcVolume, 
                    'bidPrice', bidPrice,
                    'askPrice', askPrice,
                    'timestamp', timestamp
                )
			}
		})
		//save them to redis
		console.timeEnd(`${this.exchange}'s Markets`)
		console.log(`${this.exchange}'s markets refreshed.`)
	}

	async refreshCoins(){
		super.refreshCoins.call(this);
	}
}

module.exports = Cryptopia