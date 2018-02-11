/**
 * import npm modules
 */
var persist = require('node-persist')

module.exports = function(exchange){
	persist.initSync({
		dir: './compiled/exchanges/'+exchange+'/redisKeys.json',
		stringify: JSON.stringify,
		parse: JSON.parse,
		encoding: 'utf8',
		logging: false,  // can also be custom logging function 
		continuous: true, // continously persist to disk 
		interval: false, // milliseconds, persist to disk on an interval 
		ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS 
		expiredInterval: 2 * 60 * 1000, // [NEW] every 2 minutes the process will clean-up the expired cache 
		// in some cases, you (or some other service) might add non-valid storage files to your 
		// storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error 
		forgiveParseErrors: false // [NEW]
	});
	return persist
}