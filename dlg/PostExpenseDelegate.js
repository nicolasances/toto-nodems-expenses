var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.postExpense = function(request) {

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      converter.expensePO(request).then(function(po) {

        db.db(config.dbName).collection(config.collections.expenses).insertOne(po, function(err, res) {

          db.close();

          success({id: res.insertedId});

        });
      });
    });
  });
}
