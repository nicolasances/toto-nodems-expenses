var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let id = req.params.id;
  let request = req.body;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      db.db(config.dbName).collection(config.collections.expenses).updateOne({_id: new mongo.ObjectId(id)}, converter.updateExpense(request), function(err, res) {

        db.close();

        success({});

      });
    });
  });

}
