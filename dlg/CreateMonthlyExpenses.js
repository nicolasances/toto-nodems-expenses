var mongo = require('mongodb');
var config = require('../config');
var logger = require('toto-logger');
var moment = require('moment-timezone');
var getExpenses = require('./GetExpensesDelegate');
var postExpense = require('./PostExpenseDelegate');
var correlation = require('../util/CorrelationId');
const { featureFlags } = require('../util/FeatureFlags');

var MongoClient = mongo.MongoClient;

exports.do = async (req, userContext, execContext) => {

    const cid = correlation.cid()
    const logger = execContext.logger;

    logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - Checking if monthly expenses have already been created.')

    try {

        client = await config.config.getMongoClient();
        const db = client.db(config.dbName);

        thisMonth = moment().tz('Europe/Rome').format('YYYYMM');
        prevMonth = moment().tz('Europe/Rome').subtract(1, 'months').format('YYYYMM');

        const res = await db.collection(config.collections.cron).findOne({ name: 'monthly-cron', yearMonth: thisMonth });

        // If the cron job has already run
        if (res != null && res.ran) {

            logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - Monthly expenses have already been created for month ' + thisMonth + '. Interrupting cron job.', "info");

            if (!featureFlags.createMonthlyExpensesIgnorePreviousRuns)
                return { alreadyRan: true };
        }

        // Otherwise, post the expenses that have been marked as monthly last month
        // 1. Get the expenses
        const filter = { user: 'all', yearMonth: prevMonth, monthly: "true" }
        const data = await getExpenses.do({ query: filter }, userContext, execContext);

        if (data == null || data.expenses == null || data.expenses.length == 0) {
            logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - No recurrent monthly expenses found in month  ' + prevMonth + '. Interrupting cron job.', "info");
            return { message: `No monthly expenses found for filter ${JSON.stringify(filter)}` };
        }

        logger.compute(cid, '[ MONTHLY EXPENSE CRON ] - POSTING monthly expenses for month ' + thisMonth, "info");

        for (var i = 0; i < data.expenses.length; i++) {

            expense = data.expenses[i];
            expense.yearMonth = thisMonth;
            expense.date = moment(expense.date, 'YYYYMMDD').add(1, 'months').format('YYYYMMDD');

            logger.compute(cid, `[ MONTHLY EXPENSE CRON ] - Creating expense "${expense.description}" of ${expense.amount} ${expense.currency} for user ${expense.user}`, "info")

            await postExpense.do({ body: expense })

        }

        // And then update the monthly run
        await db.collection(config.collections.cron).updateOne({name: 'monthly-cron', yearMonth: thisMonth}, { $set: {ran: true} }, { upsert: true });

        return { done: true }

    } catch (err) {

        if (err && err.code) throw err;

        const msg = "Error while creating monthly expenses";

        logger.compute(cid, msg, "error");
        console.log(err);

        throw { code: 500, message: msg, cid: cid }

    }
    finally {
        if (client) client.close();
    }

}