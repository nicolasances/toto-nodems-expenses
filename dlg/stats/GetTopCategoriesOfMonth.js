var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');
var moment = require('moment-timezone');

var MongoClient = mongo.MongoClient;

/**
 * Retrieves the top x (#maxCategories) spending categories of month m (#yearMonth)
 */
exports.do = function(req) {

  let query = req.query;

  let maxCategories = req.maxCategories != null req.maxCategories : 5;
  let yearMonth = req.yearMonth;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [
        {$match: {yearMonth: yearMonth}},
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

        success({categories: categories});

      });
    });
  });

}
