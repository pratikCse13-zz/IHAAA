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
var Exchange = require('../exchange')
var Feed = require('../../feed')
var helpers = require('../../helpers')

class Bittrex extends Exchange{
	constructor(){
		super();
	};

	//private variables
	marketsApi = 'https://bittrex.com/api/v1.1/public/getmarkets';
	marketSummariesApi = 'https://bittrex.com/api/v1.1/public/getmarketsummaries';
	currenciesApi = 'https://bittrex.com/api/v1.1/public/getcurrencies';
	makerTxnFee = 0.0025;
	takerTxnFee = 0.0025;

	getMarkets(){
		return reload('markets.json');
	}

	getMarketsApi(){
		return this.marketsApi;
	}

	getMarketSummariesApi(){
		return this.marketSummariesApi;
	}

	getCurrenciesApi(){
		return this.currenciesApi;
	}

	async refreshMarkets(){
		console.log('Refreshing Bittrex markets.')
		var options = {
			uri: this.getMarketsApi(),
			json: true // Automatically parses the JSON string in the response
		};
		try {
			var markets = await request.get(options);
		} catch(err) {
			helpers.handleError(err, 'fetching markets', 'Bittrex');
		}
		markets = markets.result;
		fs.writeFileSync(__dirname+'/markets.json', JSON.stringify(markets, null, 4));
		console.log('Bittrex markets refreshed.')		
	};

	async refreshFeed(){
		console.log('Refreshing Bittrex feed.')
		var options = {
			uri: this.getMarketSummariesApi(),
			json: true // Automatically parses the JSON string in the response
		};
		try {
			var marketSummaries = await request.get(options);
		} catch(err) {
			helpers.handleError(err, 'fetching markets summaries', 'Bittrex');
		}
		marketSummaries = marketSummaries.result;
		fs.writeFileSync(__dirname+'/markets.json', JSON.stringify(markets, null, 4));
		var newFeed = new Feed('bittrex', markets.marketCurrency, markets.baseCurrency);	
		console.log('Bittrex feeds refreshed.')		
	};
}

module.exports = Bittrex;