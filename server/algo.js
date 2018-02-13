/**
 * import npm modules
 */
var bluebird = require('bluebird')
var ncc = require('console.io-client');
var dateFormat = require('dateFormat')

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
var config = require('./config')

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
					askPrice: market.askPrice,
					timestamp: dateFormat(market.timestamp, "longTime").split(' ')[0]
				})
			} else {
				askHash.set(market.market, [{
					exchange: market.exchange,
					askPrice: market.askPrice,
					timestamp: dateFormat(market.timestamp, "longTime").split(' ')[0]
				}])
			}
			//push bid price to ask hash
			var bidArray = bidHash.get(market.market)
			if(bidArray){
				bidArray.push({
					exchange: market.exchange,
					bidPrice: market.bidPrice,
					timestamp: dateFormat(market.timestamp, "longTime").split(' ')[0]
				})
			} else {
				bidHash.set(market.market, [{
					exchange: market.exchange,
					bidPrice: market.bidPrice,
					timestamp: dateFormat(market.timestamp, "longTime").split(' ')[0]
				}])
			}
		}
	})
	allMarkets.forEach(function(market){
		var marketLogged = false;
		var askPrices = askHash.get(market)
		var bidPrices = bidHash.get(market)
		if(askPrices.length == 1 || bidPrices.length == 1){
			return;
		}
		askPrices.forEach(function(initialMarket){
			bidPrices.forEach(function(finalMarket){
				var gain = ((finalMarket.bidPrice/initialMarket.askPrice)*100) - 100
				gain = gain.toFixed(2)
				if(gain > config.opportunityThreshold){
					if(!marketLogged){
						console.log(`Market: ${market} | (${finalMarket.timestamp})`)
					}
					marketLogged = true;
					console.log(`${initialMarket.exchange} to ${finalMarket.exchange} : ${gain} %`)
					console.log(`askPrice: ${initialMarket.askPrice} -- bidPrice: ${finalMarket.bidPrice}`)
				}
			})
		})
		if(marketLogged){
			console.log('\n')
		}
	})
}