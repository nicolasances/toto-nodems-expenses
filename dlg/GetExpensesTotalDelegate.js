var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var getExchangeRate = require('./GetExchangeRateDelegate');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  // Pass targetCurrency to change the currency of the output
  let targetCurrency = req.query.targetCurrency;

  let filter = {
    yearMonth: req.params.yearMonth,
    currency: req.query.currency
  };

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      var group = {$group: {_id: null, sum: {$sum: '$amountInEuro'}}};
      var match = {$match: {yearMonth: parseInt(filter.yearMonth)}};
      if (filter.currency != null) match.$match.currency = filter.currency;

      db.db(config.dbName).collection(config.collections.expenses).aggregate([match, group]).toArray(function(err, array) {

        db.close();

        if (array == null || array.length == 0) {
          success({total: 0});
          return;
        }

        console.log(targetCurrency);

        // If required, convert into the target currency
        if (targetCurrency && targetCurrency != 'EUR') {

          getExchangeRate.getExchangeRate(targetCurrency).then((rate) => {

            let amountInEuro = array[0].sum;
            let convertedAmount = amountInEuro / rate;

            success({total: convertedAmount, currency: targetCurrency});

          })

        }

        success({total: array[0].sum});

      });
    });
  });

}
