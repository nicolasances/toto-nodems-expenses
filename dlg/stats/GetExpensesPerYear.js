var mongo = require('mongodb');
var config = require('../../config');
var getExchangeRate = require('../GetExchangeRateDelegate');

var MongoClient = mongo.MongoClient;

exports.do = function(req, userContext, execContext) {

  let query = req.query;
  let targetCurrency = req.query.targetCurrency;

  return new Promise(function(success, failure) {

    // Validation
    if (!query.user) {failure({code: 400, message: 'Missing "user" field.'}); return;}

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [
        {$match: {user: query.user}},
        {$project: {dateString: {$convert: {input: '$date', to: 'string'}}, amountInEuro: 1}},
        {$project: {year: {$substrBytes: ['$dateString', 0, 4]}, amountInEuro: 1}},
        {$group: {_id: {year: '$year'}, amount: {$sum: '$amountInEuro'}}},
        {$sort: {'_id.year': 1}}
      ]

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({months: []});
          return;
        }

        var years = [];

        for (var i = 0; i < array.length; i++) {

          years.push({
            year: array[i]._id.year,
            amount: array[i].amount
          });
        }

        // If required, convert into the target currency
        if (targetCurrency && targetCurrency != 'EUR') {

          getExchangeRate.getExchangeRate(targetCurrency).then((rate) => {

            for (var i = 0; i < years.length; i++) {
              years[i].amount = years[i].amount / rate;
              years[i].currency = targetCurrency;
            }

            success({years : years});

          })

        }
        else success({years: years});

      });
    });
  });

}
