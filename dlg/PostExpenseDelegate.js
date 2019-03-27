var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(request) {

  let body = request.body;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      converter.expensePO(body).then(function(po) {

        db.db(config.dbName).collection(config.collections.expenses).insertOne(po, function(err, res) {

          db.close();

          success({id: res.insertedId});

        });
      });
    });
  });
}
