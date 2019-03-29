var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let query = req.query;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [ {$match: converter.filterExpenses(query)},
        {$project: {date: '$date', year: {$year: {$dateFromString: {dateString: {'$toString': '$date'}, format: '%Y%m%d'}}}, month: {$month: {$dateFromString: {dateString: {'$toString': '$date'}, format: '%Y%m%d'}}}, amount: '$amountInEuro', category: '$category'}},
        {$group: {_id: {year: '$year', month: '$month', category: '$category'}, amount: {$sum: '$amount'}}},
        {$sort: {'_id.year': 1, '_id.month': 1, 'amount': -1}},
        {$group: {_id: {year: '$_id.year', month: '$_id.month'}, category: {$first: '$_id.category'}, amount: {$max: '$amount'}}},
        {$sort: {'_id.year': 1, '_id.month': 1}}
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
            year: array[i]._id.year,
            month: array[i]._id.month,
            category: array[i].category,
            amount: array[i].amount
          });
        }

        success({months: months});

      });
    });
  });

}
