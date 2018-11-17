var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(query) {

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the filter
      let filter = converter.filterExpenses(query);

      // Prepare the grouping
      // TODO: Could be optimized: no need to group by date first (i could just go to project and then group by week)
      let groupByDay = {$group: {_id: {date: '$date'}, amount: {$sum: '$amountInEuro'}}}

      // Project to extract week and year
      let weekProject = {$project: {year: {$year: {$dateFromString: {dateString: {'$toString': '$_id.date'}, format: '%Y%m%d'}}}, week: {$week: {$dateFromString: {dateString: {'$toString': '$_id.date'}, format: '%Y%m%d'}}}, amount: '$amount'}}

      // Group again by week
      let groupByWeek = {$group: {_id: {week: '$week', year: '$year'}, amount: {$sum: '$amount'}}};

      // Sorting
      let sort = {"_id.year": 1, '_id.week': 1};

      // Prepare the aggregate
      let aggregate = [filter, groupByDay, weekProject, sort]

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({days: []});
          return;
        }

        var weeks = [];

        for (var i = 0; i < array.length; i++) {

          weeks.push({
            week: array[i]._id.week,
            year: array[i]._id.year,
            amount: array[i].amount
          });
        }

        success({weeks: weeks});

      });
    });
  });

}
