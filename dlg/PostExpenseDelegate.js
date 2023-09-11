var mongo = require('mongodb');
var config = require('../config');
var converter = require('../conv/ExpenseConverter');
// var totoEventPublisher = require('toto-event-publisher');

var MongoClient = mongo.MongoClient;

exports.do = function(req, userContext, execContext) {

  let body = req.body;

  return new Promise(function(success, failure) {

    // Some validation
    if (!body.amount) {failure({code: 400, message: 'Missing "amount" field.'}); return;}
    if (!body.date) {failure({code: 400, message: 'Missing "date" field.'}); return;}
    if (!body.description) {failure({code: 400, message: 'Missing "description" field.'}); return;}
    if (!body.yearMonth) {failure({code: 400, message: 'Missing "yearMonth" field.'}); return;}
    if (!body.currency) {failure({code: 400, message: 'Missing "currency" field.'}); return;}
    if (!body.user) {failure({code: 400, message: 'Missing "user" field.'}); return;}

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
