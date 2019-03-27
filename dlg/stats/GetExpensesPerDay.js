var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let query = req.query;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the filter
      let filter = {$match: converter.filterExpenses(query)};

      // Prepare the grouping
      // TODO: Could be optimized: no need to group by date first (i could just go to project and then group by week)
      let groupByDay = {$group: {_id: {date: '$date'}, amount: {$sum: '$amountInEuro'}}}

      // Sorting
      let sort = {$sort: {"_id.date": 1}};

      // Prepare the aggregate
      let aggregate = [filter, groupByDay, sort]

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

        success({days: days});

      });
    });
  });

}
