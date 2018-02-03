'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * import npm modules
 */
var request = require('request-promise');
var Promise = require('bluebird');
var reload = require('require-reload')(require);
var fs = require('fs');

/**
 * import package modules
 */
var Exchange = require('../exchange');
var Feed = require('../../feed');

var Bittrex = function (_Exchange) {
	_inherits(Bittrex, _Exchange);

	function Bittrex() {
		_classCallCheck(this, Bittrex);

		var _this = _possibleConstructorReturn(this, (Bittrex.__proto__ || Object.getPrototypeOf(Bittrex)).call(this));

		_this.marketsApi = 'https://bittrex.com/api/v1.1/public/getmarkets';
		_this.marketSummariesApi = 'https://bittrex.com/api/v1.1/public/getmarketsummaries';
		_this.currenciesApi = 'https://bittrex.com/api/v1.1/public/getcurrencies';
		_this.makerTxnFee = 0.0025;
		_this.takerTxnFee = 0.0025;
		return _this;
	}

	//private variables


	_createClass(Bittrex, [{
		key: 'getMarkets',
		value: function getMarkets() {
			return reload('markets.json');
		}
	}, {
		key: 'getMarketsApi',
		value: function getMarketsApi() {
			return this.marketsApi;
		}
	}, {
		key: 'getMarketSummariesApi',
		value: function getMarketSummariesApi() {
			return this.marketSummariesApi;
		}
	}, {
		key: 'getCurrenciesApi',
		value: function getCurrenciesApi() {
			return this.currenciesApi;
		}
	}, {
		key: 'refreshMarkets',
		value: function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
				var options, markets;
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								console.log('Refreshing Bittrex markets.');
								options = {
									uri: this.getMarketsApi(),
									json: true // Automatically parses the JSON string in the response
								};
								_context.prev = 2;
								_context.next = 5;
								return request.get(options);

							case 5:
								markets = _context.sent;
								_context.next = 12;
								break;

							case 8:
								_context.prev = 8;
								_context.t0 = _context['catch'](2);

								console.log('Error in fetching markets for Exchange: Bittrex.');
								console.log(_context.t0);

							case 12:
								markets = markets.result;
								fs.writeFileSync(__dirname + '/markets.json', JSON.stringify(markets, null, 4));
								console.log('Bittrex markets refreshed.');

							case 15:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this, [[2, 8]]);
			}));

			function refreshMarkets() {
				return _ref.apply(this, arguments);
			}

			return refreshMarkets;
		}()
	}]);

	return Bittrex;
}(Exchange);

module.exports = Bittrex;
//# sourceMappingURL=bittrex.js.map