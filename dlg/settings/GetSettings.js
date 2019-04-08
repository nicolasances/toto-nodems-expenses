var mongo = require('mongodb');
var config = require('../../config');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let user = req.query.user;

  return new Promise(function(success, failure) {

    if (!user) {failure({code: 400, message: 'No "user" field has been provided. Please provide the email of the user.'}); return;}

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      db.db(config.dbName).collection(config.collections.settings).find({user: user}).toArray(function(err, array) {

        db.close();

        if (array == null || array.length == 0) {
          success({});
          return;
        }

        let settings = array[0];

        success({
          currency: settings.currency
        });

      });
    });
  });

}
