'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var redis = require('redis');

var Exchange = function () {
	function Exchange() {
		_classCallCheck(this, Exchange);
	}

	_createClass(Exchange, [{
		key: 'pushDataToRedis',
		value: function pushDataToRedis() {
			//logic to create a key and push the data to redis goes here
		}
	}]);

	return Exchange;
}();

module.exports = Exchange;
//# sourceMappingURL=exchange.js.map