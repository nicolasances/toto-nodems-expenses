var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');
var moment = require('moment-timezone');
var getExchangeRate = require('../GetExchangeRateDelegate');

var MongoClient = mongo.MongoClient;

/**
 * Gets the expenses per day from #dateFrom to #dateTo where both dates are optional
 */
exports.do = function(req) {

  let query = req.query;
  let targetCurrency = req.query.targetCurrency;

  return new Promise(function(success, failure) {

    let dateFrom = query.dateFrom ? parseInt(query.dateFrom) : 190001;
    let dateTo = query.dateTo ? parseInt(query.dateTo) : parseInt(moment().tz('Europe/Rome').add(1, 'days').format('YYYYMMDD'));

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [
        {$match: {$and: [{date: {$gte: parseInt(dateFrom)}}, {date: {$lte: parseInt(dateTo)}}]}},
        {$group: {_id: {date: '$date'}, amount: {$sum: '$amountInEuro'}}},
        {$sort: {"_id.date": 1}}
      ]

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({days: []});
          return;
        }

        var days = [];

        for (var i = 0; i < array.length; i++) {

          days.push({
            date: array[i]._id.date,
            amount: array[i].amount
          });
        }

        // If required, convert into the target currency
        if (targetCurrency && targetCurrency != 'EUR') {

          getExchangeRate.getExchangeRate(targetCurrency).then((rate) => {

            for (var i = 0; i < days.length; i++) {
              days[i].amount = days[i].amount / rate;
              days[i].currency = targetCurrency;
            }

            success({days : days});

          });
        }
        else success({days: days});

      });
    });
  });

}
