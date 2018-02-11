/**
 * import npm packages
 */
var reload = require('require-reload')(require)
var request = require('request-promise')
var fs = require('fs')
var bluebird = require('bluebird')

/**
 * import package modules
 */
var constants = require('./constants')
var redis = require('./redisSetup')

//formats the time provided to this format - HH.MM.SS
//if time is not provided then it creates one and formats in this format and returns
exports.getFormattedTimeForRedisKey = (input) => {
	var inputDate = input?new Date(input): new Date()
	return inputDate.getHours() +'-'+ inputDate.getMinutes() +'-'+ inputDate.getSeconds()
}

exports.reduceString = function(input){
	if(input == undefined) {
		return '';
	} else {
		return input.toString().replace(/\s/g, '').toLowerCase();
	}
}

exports.recordNewBaseCoin = function(exchange, newBaseCoin){
	var name = exchange+'BaseCoins'
	if(global[name] == undefined) {
		global[name] = []
	}
	if(global[name].indexOf(newBaseCoin) == -1) {
		global[name].push(newBaseCoin)
	}
}

exports.getBtcVolume = function(baseVolume, baseCoin, exchange){
	// return new bluebird(function(resolve, reject){
	// 	var marketName = exports.getMarketName(baseCoin, constants.STRINGS.bitcoinShortNotation)
	// 	var redisKey = exports.getRedisKey(exchange, marketName)
	// 	try {
	// 		var feed = await redis.hgetall(redisKey)
	// 		var value = feed.lastPrice
	// 	} catch(err) {
	// 		console.log(`Error in fetching ${baseCoin}/btc market's last price in generating btcVolume for exchange - ${exchange}`)
	// 		console.log(err)
	// 		return reject(err)
	// 	}
	// 	return resolve(exports.getFormattedVolume(baseVolume * value))	
	// })
	return exports.getFormattedVolume(parseFloat(baseVolume) * parseFloat(global[exchange+'-'+baseCoin]))
}

exports.getDollarVolume = function(btcVolume){
	return exports.getFormattedVolume(parseFloat(btcVolume) * parseFloat(global.bitcoinInUsd))
}

exports.updateBitcoinValue = async function(){
	var options = {
		uri: constants.coinDeskGetBitcoinStatsApi,
		json: true // Automatically parses the JSON string in the response
	}
	try {
		var stats = await request.get(options)
		global.bitcoinInUsd = parseFloat(stats.bpi.USD.rate.replace(/,/g, ''))
	} catch(err) {
		console.log('Error in extracting the value of bitcoin from coindesk.')
		console.log(err)
	}
	// fs.writeFileSync(__dirname+'/dynamo.js', JSON.stringify(dynamo, null, 4))
}

exports.handleError = (err, task, exchange) => {
	console.log(`Error in $task for exchange: $exchange`)
	console.log(err)
}

exports.getRedisKeyForMarketFeed = function(exchange, market){
	return exchange + '|' + market;
}

exports.getRedisKeyForCoinData = function(exchange, coin){
	return exchange + '|' + coin;
}

exports.getMarketName = function(shitCoin, baseCoin){
	return exports.reduceString(shitCoin) + '/' + exports.reduceString(baseCoin);
}

exports.getMarketCurrency = function(currency){
	return exports.reduceString(currency);
};

exports.getBaseCurrency = function(currency){
	return exports.reduceString(currency);
};

exports.getMarketCurrencyLong = function(currency){
	return exports.reduceString(currency);
};

exports.getBaseCurrencyLong = function(currency){
	return exports.reduceString(currency);
};

exports.getMarketIsActive = function(input){
	if(input == null || input == undefined){
		return true;
	} else if(input == 'true' || input == true || input) {
		return true;
	} else {
		return false;
	}
}

exports.getCoinIsActive = function(input){
	if(input == null || input == undefined){
		return true;
	} else if(input == 'true' || input == true || input) {
		return true;
	} else {
		return false;
	}
}

exports.getFormattedValue = function(input){
	if(typeof input == 'string'){
		input = input.replace(/(,|\s)/g, '')
	}
	input = parseFloat(input)
	if((input != 0 && !input) || typeof input != 'number' || isNaN(input)){
		return 'NA';
	}
	return input.toFixed(8);
}

exports.getFormattedVolume = function(input){
	if(typeof input == 'string'){
		input = input.replace(/(,|\s)/g, '')
	}
	input = parseFloat(input)
	if((input != 0 && !input) || typeof input != 'number' || isNaN(input)){
		return 'NA';
	}
	return input.toFixed(2);
}

exports.getFormattedPrice = function(input){
	if(typeof input == 'string'){
		input = input.replace(/(,|\s)/g, '')
	}	
	input = parseFloat(input)
	if((input != 0 && !input) || typeof input != 'number' || isNaN(input)){
		return 'NA';
	}
	var integerPart = parseInt(input);
	if(integerPart == 0){
		return input.toFixed(8)
	} else if(integerPart < 10) {
		return input.toFixed(4)
	} else {
		return input.toFixed(2)
	}
}

exports.getTimestamp = function(){
	return new Date();
}