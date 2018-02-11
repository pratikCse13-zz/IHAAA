/**
 * npm packages import
 */
var express = require('express')

/**
 * project modules import
 */
var miner = require('./miner.js')

var app = express();

miner();
require('./marketsRefresher.js');

app.listen(3000, function(){
	console.log('server started in 3000');
});