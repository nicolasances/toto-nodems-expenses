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

      // Project to extract month and year
      let monthProject = {$project: {year: {$year: {$dateFromString: {dateString: {'$toString': '$_id.date'}, format: '%Y%m%d'}}}, month: {month: {$dateFromString: {dateString: {'$toString': '$_id.date'}, format: '%Y%m%d'}}}, amount: '$amount'}}

      // Group again by month
      let groupByMonth = {$group: {_id: {month: '$month', year: '$year'}, amount: {$sum: '$amount'}}};

      // Sorting
      let sort = {$sort: {"_id.year": 1, '_id.month': 1}};

      // Prepare the aggregate
      let aggregate = [filter, groupByDay, monthProject, groupByMonth, sort]

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({months: []});
          return;
        }

        var months = [];

        for (var i = 0; i < array.length; i++) {

          months.push({
            month: array[i]._id.month,
            year: array[i]._id.year,
            amount: array[i].amount
          });
        }

        success({months: months});

      });
    });
  });

}
