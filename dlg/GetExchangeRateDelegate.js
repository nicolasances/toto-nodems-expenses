var config = require('../config');
var http = require('request');
var moment = require('moment-timezone');

exports.getExchangeRate = function(currency) {

  return new Promise(function(success, failure) {

    var data = {
      url : config.exchangeRateUrl + '/' + currency + '/EUR',
      headers : {
        'User-Agent' : 'node.js',
        'Accept' : 'application/json'
      }
    };

    http.get(data, function(error, response, body) {

      var rates = JSON.parse(body);

      success(rates.rate);

    });

  });
}
