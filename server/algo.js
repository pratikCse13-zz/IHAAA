/**
 * import npm modules
 */
var bluebird = require('bluebird')
var ncc = require('console.io-client');

ncc.connect({
	endpoint: "http://localhost:8080",
	name: "marketplace"
}, function(err, result){
});

/**
 * import package modules
 */
var hash = require('hashmap')
var redis = require('./redisSetup')

module.exports = async function(){
	try {
		var keys = await redis.keysAsync('*|*/*')
		var multi = redis.multi()
		keys.forEach(function(key){
			multi.hgetall(key)
		})
		var markets = await multi.execAsync()
	} catch(err) {
		console.log('Error in fetching all market keys ')
		console.log(err)	
	}
	var askHash = new hash();
	var bidHash = new hash();
	var allMarkets = [];
	markets.forEach(function(market){
		if(allMarkets.indexOf(market.market) == -1){
			allMarkets.push(market.market)
		}
		//if market is active
		if(market.marketIsActive){
			//push ask price to ask hash
			var askArray = askHash.get(market.market)
			if(askArray){
				askArray.push({
					exchange: market.exchange,
					askPrice: market.askPrice
				})
			} else {
				askHash.set(market.market, [{
					exchange: market.exchange,
					askPrice: market.askPrice
				}])
			}
			//push bid price to ask hash
			var bidArray = bidHash.get(market.market)
			if(bidArray){
				bidArray.push({
					exchange: market.exchange,
					bidPrice: market.bidPrice
				})
			} else {
				bidHash.set(market.market, [{
					exchange: market.exchange,
					bidPrice: market.bidPrice
				}])
			}
		}
	})
	allMarkets.forEach(function(market){
		var askPrices = askHash.get(market)
		var bidPrices = bidHash.get(market)
		if(askPrices.length == 1 || bidPrices.length == 1){
			return;
		}
		askPrices.forEach(function(initialMarket){
			bidPrices.forEach(function(finalMarket){
				var gain = ((finalMarket.bidPrice/initialMarket.askPrice)*100) - 100
				gain = gain.toFixed(2)
				if(gain > 0){
					console.log(`Market: ${market}`)
					console.log(`${initialMarket.exchange} to ${finalMarket.exchange} : ${gain} %`)
					console.log(`askPrice: ${initialMarket.askPrice} -- bidPrice: ${finalMarket.bidPrice}`)
					console.log(`\n`)
				}
			})
		})
	})
}