class Feed {
	constructor(exchange, marketCoin, baseCoin, marketCoinLong, baseCoinLong, market, marketIsActive, volume, lastPrice, btcVolume, timeStamp, bidPrice,
	askPrice, txMakerFee, txTakerFee, coinIsActive, notice, withdrawFee){
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
	}
}

module.exports = Feed;