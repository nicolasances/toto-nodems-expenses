var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

/**
 * Get the total expenses of a specific week defined by dateFrom and dateTo
 */
exports.do = function(req) {

  let query = req.query;

  return new Promise(function(success, failure) {

    let dateFrom = query.dateFrom;
    let dateTo = query.dateTo;

    if (dateFrom == null) {failure({code: 400, message: 'Field "dateFrom" is required'}); return;}
    if (dateTo == null) {failure({code: 400, message: 'Field "dateTo" is required'}); return;}

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [
        {$match: {$and: [{date: {$gte: 20190218}}, {date: {$lte: 20190224}}]}},
        {$group: {_id: null, amount: {$sum: '$amountInEuro'}}}
      ]

      db.db(config.dbName).collection(config.collections.expenses).aggregate(aggregate).toArray(function(err, array) {

        db.close();

        if (array == null || array.length == 0) {
          success({});
          return;
        }

        success({amount: array[0].amount});

      });
    });
  });

}
