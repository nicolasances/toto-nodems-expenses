var mongo = require('mongodb');
var config = require('../config');
const cron = require("node-cron")
var logger = require('toto-logger');
var moment = require('moment-timezone');
var getExpenses = require('../dlg/GetExpensesDelegate');
var postExpense = require('../dlg/PostExpenseDelegate');
var correlation = require('../util/CorrelationId');

var MongoClient = mongo.MongoClient;

/**
 * Daily cron that will trigger a creation of monthly expenses, in case it hasn't 
 * ran in the current month
 */
exports.startCron = () => {

    cron.schedule("*/30 * * * * *", () => {

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

                    for (var i = 0; i < data.expenses.length; i++) {

                        expense = data.expenses[i];
                        expense.yearMonth = thisMonth;
                        expense.date = moment(expense.date, 'YYYYMMDD').add(1, 'months')

                        postExpense.do({body: expense})

                    }

                    // And then update the monthly run
                    db.db(config.dbName).collection(config.collections.cron).insertOne({name: 'monthly-cron', yearMonth: thisMonth, ran: true}, function(err, res) {
                        db.close();
                    });

                })
    
            });
        });

    });
}