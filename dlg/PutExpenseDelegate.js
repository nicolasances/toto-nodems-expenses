var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req, userContext, execContext) {

  let id = req.params.id;
  let request = req.body;

  
  return new Promise(function(success, failure) {

    // Validations
    if (id.length != 24) {failure({code: 400, message: 'The expense id is not a valid identifier. Got: ' + id}); return;}

    // Some field has to be prese
    if (request == null || (Object.keys(request).length === 0 && request.constructor === Object)) {
      failure({code: 400, message: 'No body was passed to PUT expense'});
      return;
    }

    converter.updateExpense(request).then((update) => {

      return MongoClient.connect(config.mongoUrl, function(err, db) {

        db.db(config.dbName).collection(config.collections.expenses).updateOne({_id: new mongo.ObjectId(id)}, update, function(err, res) {

          db.close();

          success(res);

        });
      });
    });
  });
}
