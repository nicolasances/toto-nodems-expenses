const cron = require("node-cron")
createMonthlyExpenses = require('../dlg/CreateMonthlyExpenses');

/**
 * Daily cron that will trigger a creation of monthly expenses, in case it hasn't 
 * ran in the current month
 */
exports.startCron = () => {
    // Run one time at startup
    createMonthlyExpenses.do()

    // Cron runs every day at 19:00:00
    cron.schedule("0 0 19 * * *", createMonthlyExpenses.do);
}