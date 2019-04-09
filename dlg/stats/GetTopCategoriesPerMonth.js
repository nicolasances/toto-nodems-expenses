var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');
var getExchangeRate = require('../GetExchangeRateDelegate');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let query = req.query;
  let targetCurrency = req.query.targetCurrency;

  return new Promise(function(success, failure) {

    let yearMonthGte = query.yearMonthGte == null ? 190001 : parseInt(query.yearMonthGte);

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [ {$match: {yearMonth: {$gte: yearMonthGte}}},
        {$group: {_id: {yearMonth: '$yearMonth', category: '$category'}, amount: {$sum: '$amountInEuro'}}},
        {$sort: {'_id.yearMonth': 1, 'amount': -1}},
        {$group: {_id: {yearMonth: '$_id.yearMonth'}, category: {$first: '$_id.category'}, amount: {$max: '$amount'}}},
        {$sort: {'_id.yearMonth': 1}}
      ];

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({months: []});
          return;
        }

        var months = [];

        for (var i = 0; i < array.length; i++) {

          months.push({
            yearMonth: array[i]._id.yearMonth,
            category: array[i].category,
            amount: array[i].amount
          });
        }

        // If required, convert into the target currency
        if (targetCurrency && targetCurrency != 'EUR') {

          getExchangeRate.getExchangeRate(targetCurrency).then((rate) => {

            for (var i = 0; i < months.length; i++) {
              months[i].amount = months[i].amount / rate;
              months[i].currency = targetCurrency;
            }

            success({months : months});

          })

        }
        else success({months: months});

      });
    });
  });

}
