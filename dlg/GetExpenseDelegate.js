var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.getExpense = function(id) {

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      db.db(config.dbName).collection(config.collections.expenses).find({_id: new mongo.ObjectId(id)}).toArray(function(err, array) {

        db.close();

        success(converter.expenseTO(array[0]));

      });
    });
  });

}
