/**
 * import npm modules
 */
var bluebird = require('bluebird')
var ncc = require('console.io-client')
require('babel-polyfill')
var dateFormat = require('dateFormat')
var childProcess = require('child_process')
var Bull = require('bull')

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
	//define queue for depth calculation
	var depthCalculatorQueue = new Bull('opportunity depth calculating queue')
	depthCalculatorQueue.process(config.parallelDepthCalculators, __dirname+'/opportunityDepthCalculator.js')
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
			// if(askArray){
			// 	askArray.push({
			// 		exchange: market.exchange,
			// 		askPrice: market.askPrice,
			// 		timestamp: dateFormat(market.timestamp, "longTime").split(' ')[0]
			// 	})
			// } else {
			// 	askHash.set(market.market, [{
			// 		exchange: market.exchange,
			// 		askPrice: market.askPrice,
			// 		timestamp: dateFormat(market.timestamp, "longTime").split(' ')[0]
			// 	}])
			// }
			if(askArray){
				askArray.push(market)
			} else {
				askHash.set(market.market, [market])
			}
			//push bid price to ask hash
			var bidArray = bidHash.get(market.market)
			if(bidArray){
				bidArray.push(market)
			} else {
				bidHash.set(market.market, [market])
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
				var askPrice = parseFloat(initialMarket.askPrice)
				var bidPrice = parseFloat(finalMarket.bidPrice)
				var gain = ((bidPrice-askPrice)/askPrice)*100
				gain = gain.toFixed(2)
				if(gain > 0){
					// if(!marketLogged){
					// 	console.log(`Market: ${market} | (${finalMarket.timestamp})`)
					// }
					// marketLogged = true;
					// console.log(`${initialMarket.exchange} to ${finalMarket.exchange} : ${gain} %`)
					// console.log(`askPrice: ${initialMarket.askPrice} -- bidPrice: ${finalMarket.bidPrice}`)
					// var worker = childProcess.fork('./compiled/depthCalculator')
					// worker.send({
					// 	initialMarket: initialMarket,
					// 	finalMarket: finalMarket
					// })
					depthCalculatorQueue.add({
						initialMarket: initialMarket,
						finalMarket: finalMarket
					})
				}
			})
		})
		if(marketLogged){
			console.log('\n')
		}
	})
}