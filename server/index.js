/**
 * npm packages import
 */
var express = require('express')

/**
 * project modules import
 */
var miner = require('./miner.js')

var app = express();

var redis = require('redis');
var redisClient = redis.createClient();

miner();
require('./marketsRefresher.js');

app.listen(3000, function(){
	console.log('server started in 3000');
});