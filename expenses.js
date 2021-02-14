var logger = require('toto-logger');
var Controller = require('toto-api-controller');
// var totoEventPublisher = require('toto-event-publisher');
// var TotoEventConsumer = require('toto-event-consumer');

var putExpenseDlg = require('./dlg/PutExpenseDelegate');
var postExpense = require('./dlg/PostExpenseDelegate');
var getExpensesTotalsDlg = require('./dlg/GetExpensesTotalsDelegate');
var getExpensesTotalDlg = require('./dlg/GetExpensesTotalDelegate');
var getExpenses = require('./dlg/GetExpensesDelegate');
var getExpenseDlg = require('./dlg/GetExpenseDelegate');
var getCategoriesDlg = require('./dlg/GetCategoriesDelegate');
var deleteExpenseDlg = require('./dlg/DeleteExpenseDelegate');

var getExpensesPerDay = require('./dlg/stats/GetExpensesPerDay');
var getExpensesPerYear = require('./dlg/stats/GetExpensesPerYear');
var getExpensesPerMonth = require('./dlg/stats/GetExpensesPerMonth');
var getExpensesOfWeek = require('./dlg/stats/GetExpensesOfWeek');
var getTopCategoriesPerMonth = require('./dlg/stats/GetTopCategoriesPerMonth');
var getTopCategoriesOfMonth = require('./dlg/stats/GetTopCategoriesOfMonth');

var getSettings = require('./dlg/settings/GetSettings');
var putSettings = require('./dlg/settings/PutSettings');

// var monthlyCron = require('./cron/MonthlyCron');

var apiName = 'expenses';

// Event consumer and publisher
// totoEventPublisher.registerTopic({topicName: 'erboh-predict-single', microservice: apiName})

// var totoEventConsumer = new TotoEventConsumer(apiName, 'expenseUpdateRequested', (event) => {
//     /**
//      * Expects the event to be formatted as a regular PUT /expenses/{id} payload, with, in addition,
//      * the id of the expense
//      */
//     putExpenseDlg.do({
//         params: {id: event.id},
//         body: event
//     }).then(() => {}, (error) => {
//         logger.compute(error.correlationId, error.message, 'error')
//     })
// });

// Start the cron jobs
// monthlyCron.startCron();

var api = new Controller(apiName, totoEventPublisher, totoEventConsumer);

api.path('GET', '/expenses', getExpenses);
api.path('POST', '/expenses', postExpense);

api.path('GET', '/expenses/totals', getExpensesTotalsDlg);

api.path('GET', '/expenses/:id', getExpenseDlg);
api.path('PUT', '/expenses/:id', putExpenseDlg);
api.path('DELETE', '/expenses/:id', deleteExpenseDlg);

api.path('GET', '/expenses/:yearMonth/total', getExpensesTotalDlg);

api.path('GET', '/categories', getCategoriesDlg);

api.path('GET', '/stats/expensesPerYear', getExpensesPerYear);
api.path('GET', '/stats/expensesPerMonth', getExpensesPerMonth);
api.path('GET', '/stats/expensesPerDay', getExpensesPerDay);
api.path('GET', '/stats/expensesOfWeek', getExpensesOfWeek);
api.path('GET', '/stats/topCategoriesPerMonth', getTopCategoriesPerMonth);
api.path('GET', '/stats/topCategoriesOfMonth', getTopCategoriesOfMonth);

api.path('GET', '/settings', getSettings);
api.path('PUT', '/settings', putSettings);

api.listen();
