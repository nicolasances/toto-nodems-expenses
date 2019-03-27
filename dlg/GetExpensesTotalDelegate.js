var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

exports.do = function(req) {

  let filter = {
    yearMonth: req.params.yearMonth,
    currency: req.query.currency
  };

  return new Promise(function(success, failure) {

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      var group = {$group: {_id: null, sum: {$sum: '$amountInEuro'}}};
      var match = {$match: {yearMonth: parseInt(filter.yearMonth)}};
      if (filter.currency != null) match.$match.currency = filter.currency;

      db.db(config.dbName).collection(config.collections.expenses).aggregate([match, group]).toArray(function(err, array) {

        db.close();

        if (array == null || array.length == 0) {
          success({total: 0});
          return;
        }

        success({total: array[0].sum});

      });
    });
  });

}
