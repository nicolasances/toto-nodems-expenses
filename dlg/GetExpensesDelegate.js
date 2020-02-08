var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');

var MongoClient = mongo.MongoClient;

/**
 * Admitted query params for FILTERING :
 *     { yearMonth: req.query.yearMonth,
 *       maxResults: req.query.maxResults,
 *       category: req.query.category,
 *       cardId: req.query.cardId,
 *       cardMonth: req.query.cardMonth,
 *       cardYear: req.query.cardYear,
 *       currency: req.query.currency,
 *       dateGte: req.query.dateGte,
 *       tag: req.query.tag, // FORMATTED as a tagName:tagValue
 *     }
 * Admitted query params for sorting:
 *     { sortDate: req.query.sortDate,
 *       sortAmount: req.query.sortAmount,
 *       sortYearMonth: req.query.sortYearMonth,
 *       sortDesc: req.query.sortDesc
 *     }
 */
exports.do = function(req) {

  let filter = req.query;
  let sort = req.query;

  return new Promise(function(success, failure) {

    // Validation
    if (!req.query.user) {failure({code: 400, message: 'Missing "user" field.'}); return;}

    return MongoClient.connect(config.mongoUrl, function(err, db) {

      if (filter.maxResults == null) filter.maxResults = 0;

      db.db(config.dbName).collection(config.collections.expenses).find(converter.filterExpenses(filter), {limit: filter.maxResults}).sort(converter.sortExpenses(sort)).toArray(function(err, array) {

        db.close();

        if (array == null) {
          success({expenses: []});
          return;
        }

        var expenses = [];

        for (var i = 0; i < array.length; i++) {
          expenses.push(converter.expenseTO(array[i]));
        }

        success({expenses: expenses});

      });
    });
  });

}
