var mongo = require('mongodb');
var config = require('../../config');
var converter = require('../../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

/**
 * Get the total expenses of a specific week defined by dateFrom and dateTo
 */
exports.do = function(req, userContext, execContext) {

  let query = req.query;

  return new Promise(function(success, failure) {

    let dateFrom = query.dateFrom;
    let dateTo = query.dateTo;

    // Validation
    if (!query.user) {failure({code: 400, message: 'Missing "user" field.'}); return;}
    if (dateFrom == null) {failure({code: 400, message: 'Field "dateFrom" is required'}); return;}
    if (dateTo == null) {failure({code: 400, message: 'Field "dateTo" is required'}); return;}

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      // Prepare the aggregate
      let aggregate = [
        {$match: {$and: [{user: query.user}, {date: {$gte: parseInt(dateFrom)}}, {date: {$lte: parseInt(dateTo)}}]}},
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
