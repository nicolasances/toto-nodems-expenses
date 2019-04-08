var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/SettingsConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let body = req.body;

  return new Promise(function(success, failure) {

    // Validations
    if (!body.user) {failure({code: 400, message: 'The "user" field is mandatory and should contain the user email.'}); return;}

    converter.update(body).then((update) => {

      return MongoClient.connect(config.mongoUrl, function(err, db) {

        db.db(config.dbName).collection(config.collections.settings).updateOne({user: body.user}, update, {upsert: true}, function(err, res) {

          db.close();

          success(res);

        });
      });
    });
  });
}
