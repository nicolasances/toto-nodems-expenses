var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var getExchangeRate = require('./GetExchangeRateDelegate');

var MongoClient = mongo.MongoClient;

exports.do = function(req, userContext, execContext) {

  // Pass targetCurrency to change the currency of the output
  let targetCurrency = req.query.targetCurrency;

  let filter = {
    yearMonth: req.params.yearMonth,
    currency: req.query.currency
  };

  return new Promise(function(success, failure) {

    // Validation
    if (!req.query.user) {failure({code: 400, message: 'Missing "user" field.'}); return;}

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      var group = {$group: {_id: null, sum: {$sum: '$amountInEuro'}}};
      var match = {$match: {user: req.query.user, yearMonth: parseInt(filter.yearMonth)}};
      if (filter.currency != null) match.$match.currency = filter.currency;

      db.db(config.dbName).collection(config.collections.expenses).aggregate([match, group]).toArray(function(err, array) {

        db.close();

        if (array == null || array.length == 0) {
          success({total: 0});
          return;
        }

        // If required, convert into the target currency
        if (targetCurrency && targetCurrency != 'EUR') {

          getExchangeRate.getExchangeRate(targetCurrency).then((rate) => {

            let amountInEuro = array[0].sum;
            let convertedAmount = amountInEuro / rate;

            success({total: convertedAmount, currency: targetCurrency});

          })

        }
        else success({total: array[0].sum});

      });
    });
  });

}
