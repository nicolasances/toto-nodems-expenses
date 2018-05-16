var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.getExpenses = function(filter, sort) {

  console.log(sort);

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      if (filter.maxResults == null) filter.maxResults = 0;

      db.db(config.dbName).collection(config.collections.expenses).find(converter.filterExpenses(filter), {limit: filter.maxResults}).sort(converter.sortExpenses(sort)).toArray(function(err, array) {

        db.close();

        var expenses = [];

        for (var i = 0; i < array.length; i++) {
          expenses.push(converter.expenseTO(array[i]));
        }

        success({expenses: expenses});

      });
    });
  });

}
