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

      // Fallback: if I went over the quota
      // TEMPORARY!!
      // TO BE FIXED: cache every day the rate, since it only changes once a day
      if (rates.error) {
        if (currency == 'DKK') rates.rate = 7.48;
      }

      success(rates.rate);

    });

  });
}
