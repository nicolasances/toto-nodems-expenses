var mongo = require('mongodb');
var config = require('../config');
var logger = require('toto-logger');
var moment = require('moment-timezone');
var getExpenses = require('./GetExpensesDelegate');
var postExpense = require('./PostExpenseDelegate');
var correlation = require('../util/CorrelationId');

var MongoClient = mongo.MongoClient;

exports.do = () => {

    cid = correlation.cid()

    logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - Checking if monthly expenses have already been created.')

    return MongoClient.connect(config.mongoUrl, function(err, db) {

        thisMonth = moment().tz('Europe/Rome').format('YYYYMM');
        prevMonth = moment().tz('Europe/Rome').subtract(1, 'months').format('YYYYMM');

        db.db(config.dbName).collection(config.collections.cron).findOne({name: 'monthly-cron', yearMonth: thisMonth}, function(err, res) {

            // If the cron job has already ran
            if (res != null && res.ran) {
                logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - Monthly expenses have already been created for month ' + thisMonth + '. Interrupting cron job.');
                db.close();
                return;
            }

            // Otherwise, post the expenses that have been marked as monthly last month
            // 1. Get the expenses
            getExpenses.do({ query: {user: 'all', yearMonth: prevMonth, monthly: true} }).then((data) => {

                if (data == null || data.expenses == null || data.expenses.length == 0) {
                    logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - No recurrent monthly expenses found in month  ' + prevMonth + '. Interrupting cron job.');
                    db.close();
                    return;
                }

                logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - POSTING monthly expenses for month ' + thisMonth);

                for (var i = 0; i < data.expenses.length; i++) {

                    expense = data.expenses[i];
                    expense.yearMonth = thisMonth;
                    expense.date = moment(expense.date, 'YYYYMMDD').add(1, 'months').format('YYYYMMDD');

                    postExpense.do({body: expense})

                }

                // And then update the monthly run
                db.db(config.dbName).collection(config.collections.cron).insertOne({name: 'monthly-cron', yearMonth: thisMonth, ran: true}, function(err, res) {
                    db.close();
                });

            })

        });
    });

}