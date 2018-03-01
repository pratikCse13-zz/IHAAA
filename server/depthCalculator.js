/**
 * import npm modules
 */
var request = require('request-promise')
require('babel-polyfill')
var _ = require('lodash')

/**
 * import package modules
 */
var redisClient = require('./redisSetup')

process.on('message', async (marketFeeds)=>{
    var initialMarket = marketFeeds.initialMarket
    var finalMarket = marketFeeds.finalMarket
    //get sell orders for initial exchange
    //get buy orders for final exchange
    if(initialMarket.quantityKey && initialMarket.rateKey && initialMarket.orderBookApi && initialMarket.sellKey &&
        finalMarket.quantityKey && finalMarket.rateKey && finalMarket.orderBookApi && finalMarket.buyKey) {
        try {
            var [initialMarketOrderData, finalMarketOrderData] = await Promise.all([
                request.get({
                    uri: initialMarket.orderBookApi,
                    json: true
                }),
                request.get({
                    uri: finalMarket.orderBookApi,
                    json: true
                })
            ])
        } catch(err) {
            console.log(`Error while fetching order books for the opportunity: `)
            console.log(`${initialMarket.exchange} to ${finalMarket.exchange}`)
            console.log(`askPrice: ${initialMarket.askPrice} -- bidPrice: ${finalMarket.bidPrice}`)	
            process.exit()
        }
        
        //traverse down to the sell orders array
        var routeToSellOrder = initialMarket.sellKey.split('.')
        var sellOrders = initialMarketOrderData
        routeToSellOrder.forEach((key)=>{
            sellOrders = sellOrders[key]
        })
        //traverse down to the buy orders array
        var routeToBuyOrder = finalMarket.buyKey.split('.')
        var buyOrders = finalMarketOrderData
        routeToBuyOrder.forEach((key)=>{
            buyOrders = buyOrders[key]
        })
        //the algo
        //initialize
        var amountToInvest = 0
        var totalSellPrice = 0
        var totalBuyPrice = 0
        var sellIndex = 0
        var buyIndex = 0
        var currentBuyOrder = buyOrders[buyIndex]
        var buyOrdersLength = buyOrders.length
        var sellOrdersLength = sellOrders.length
        var currentSellOrder = sellOrders[sellIndex]
        var buyRate = parseFloat(currentBuyOrder[finalMarket.rateKey])
        var sellRate = parseFloat(currentSellOrder[initialMarket.rateKey])
        var buyQuantity = parseFloat(currentBuyOrder[finalMarket.quantityKey])
        var sellQuantity = parseFloat(currentSellOrder[initialMarket.quantityKey])
        //see if the buy - sell is positive
        do {
            if((buyRate - sellRate) > 0){
                if(buyQuantity > sellQuantity){
                    //put lesser amount into bag
                    amountToInvest += sellQuantity
                    totalBuyPrice += sellQuantity*buyRate
                    totalSellPrice += sellQuantity*sellRate
                    //larger amount with larger amount - smaller amount
                    buyQuantity = buyQuantity - sellQuantity
                    //replace smaller amount with next value and 
                    //replace the value whose amount is less with next value
                    sellIndex++
                    sellRate = parseFloat(sellOrders[sellIndex][initialMarket.rateKey])
                    sellQuantity = parseFloat(sellOrders[sellIndex][initialMarket.quantityKey])
                } else {
                    //put lesser amount into bag
                    amountToInvest += buyQuantity
                    totalBuyPrice += buyQuantity*buyRate
                    totalSellPrice += buyQuantity*sellRate
                    //larger amount with larger amount - smaller amount
                    sellQuantity = sellQuantity - buyQuantity
                    //replace smaller amount with next value and 
                    //replace the value whose amount is less with next value
                    buyIndex++
                    buyRate = parseFloat(buyOrders[buyIndex][finalMarket.rateKey])
                    buyQuantity = parseFloat(buyOrders[buyIndex][finalMarket.quantityKey])
                }
            } else {
                break
            }    
        } while((buyIndex < buyOrdersLength || buyIndex <= 20) && (sellIndex < sellOrdersLength || sellIndex <= 20))
        try {
            var baseCoinValueInDollar = await redisClient.getAsync(finalMarket.baseCoin)
        } catch(err) {
            console.log(`Error while fetching base coin value in dollars for the opportunity: `)
            console.log(`${initialMarket.exchange} to ${finalMarket.exchange}`)
            console.log(`askPrice: ${initialMarket.askPrice} -- bidPrice: ${finalMarket.bidPrice}`)	
            process.exit()
        }
        baseCoinValueInDollar = parseFloat(baseCoinValueInDollar)
        console.log(`Market: ${finalMarket.market} | (${finalMarket.timestamp})`)
        console.log(`${initialMarket.exchange} to ${finalMarket.exchange} gain: ${(totalBuyPrice - totalSellPrice) * baseCoinValueInDollar} $ / ${(totalBuyPrice - totalSellPrice)} ${initialMarket.baseCoin} @ ${baseCoinValueInDollar}`)
        console.log(`total coins to invest - ${amountToInvest} ${initialMarket.marketCoin}`)
        console.log('\n\n')
    }
    process.exit()
})

