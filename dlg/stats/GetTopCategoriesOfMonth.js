var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');
var moment = require('moment-timezone');
var getExchangeRate = require('../GetExchangeRateDelegate');

var MongoClient = mongo.MongoClient;

/**
 * Retrieves the top x (#maxCategories) spending categories of month m (#yearMonth)
 */
exports.do = function(req, userContext, execContext) {

  let query = req.query;
  let targetCurrency = req.query.targetCurrency;

  return new Promise(function(success, failure) {

    // Validation
    if (!query.user) {failure({code: 400, message: 'Missing "user" field.'}); return;}
    if (query.yearMonth == null) {failure({code: 400, message: 'Missing "yearMonth" query parameter.'}); return;}

    let maxCategories = query.maxCategories != null ? parseInt(query.maxCategories) : 5;
    let yearMonth = parseInt(query.yearMonth);

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [
        {$match: {user: query.user, yearMonth: yearMonth}},
        {$group: {_id: {category: '$category'}, amount: {$sum: '$amountInEuro'}}},
        {$sort: {'amount': -1}},
        {$limit: maxCategories}
      ];

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({categories: []});
          return;
        }

        var categories = [];

        for (var i = 0; i < array.length; i++) {

          categories.push({
            category: array[i]._id.category,
            amount: array[i].amount
          });
        }

        // If required, convert into the target currency
        if (targetCurrency && targetCurrency != 'EUR') {

          getExchangeRate.getExchangeRate(targetCurrency).then((rate) => {

            for (var i = 0; i < categories.length; i++) {
              categories[i].amount = categories[i].amount / rate;
              categories[i].currency = targetCurrency;
            }

            success({categories : categories});

          })

        }
        else success({categories: categories});

      });
    });
  });

}
