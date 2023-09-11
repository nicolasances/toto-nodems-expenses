var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req, userContext, execContext) {

  let id = req.params.id;

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      db.db(config.dbName).collection(config.collections.expenses).deleteOne({_id: new mongo.ObjectId(id)}, function(err, res) {

        db.close();

        success({});

      });
    });
  });

}
