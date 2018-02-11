/**
 * npm modules import
 */
var redis = require('redis');
var bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype)

var redisClient = redis.createClient();

module.exports = redisClient;
