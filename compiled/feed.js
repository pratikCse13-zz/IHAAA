"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Feed = function Feed(exchange, marketCoin, baseCoin, marketCoinLong, baseCoinLong, market, marketIsActive, volume, lastPrice, btcVolume, timeStamp, bidPrice, askPrice, txMakerFee, txTakerFee, coinIsActive, notice, withdrawFee) {
	_classCallCheck(this, Feed);

	this.exchange = exchange;
	this.marketCoin = marketCoin;
	this.baseCoin = baseCoin;
	this.marketCoinLong = marketCoinLong;
	this.baseCoinLong = baseCoinLong;
	this.market = market;
	this.marketIsActive = marketIsActive;
	this.volume = volume;
	this.lastPrice = lastPrice;
	this.btcVolume = btcVolume;
	this.timeStamp = timeStamp;
	this.bidPrice = bidPrice;
	this.askPrice = askPrice;
	this.txMakerFee = txMakerFee;
	this.txTakerFee = txTakerFee;
	this.coinIsActive = coinIsActive;
	this.notice = notice;
	this.withdrawFee = withdrawFee;
};

module.exports = Feed;
//# sourceMappingURL=feed.js.map