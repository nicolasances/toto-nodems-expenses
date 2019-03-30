var Controller = require('toto-api-controller');
var totoEventPublisher = require('toto-event-publisher');

var putExpenseDlg = require('./dlg/PutExpenseDelegate');
var postExpense = require('./dlg/PostExpenseDelegate');
var getExpensesTotalsDlg = require('./dlg/GetExpensesTotalsDelegate');
var getExpensesTotalDlg = require('./dlg/GetExpensesTotalDelegate');
var getExpenses = require('./dlg/GetExpensesDelegate');
var getExpenseDlg = require('./dlg/GetExpenseDelegate');
var getCategoriesDlg = require('./dlg/GetCategoriesDelegate');
var deleteExpenseDlg = require('./dlg/DeleteExpenseDelegate');

var getExpensesPerDay = require('./dlg/stats/GetExpensesPerDay');
var getExpensesPerMonth = require('./dlg/stats/GetExpensesPerMonth');
var getExpensesOfWeek = require('./dlg/stats/GetExpensesOfWeek');
var getTopCategoriesPerMonth = require('./dlg/stats/GetTopCategoriesPerMonth');
var getTopCategoriesOfMonth = require('./dlg/stats/GetTopCategoriesOfMonth');

var apiName = 'expenses';

var api = new Controller(apiName, totoEventPublisher);

api.path('GET', '/expenses', getExpenses);
api.path('POST', '/expenses', postExpense);

api.path('GET', '/expenses/totals', getExpensesTotalsDlg);

api.path('GET', '/expenses/:id', getExpenseDlg);
api.path('PUT', '/expenses/:id', putExpenseDlg);
api.path('DELETE', '/expenses/:id', deleteExpenseDlg);

api.path('GET', '/expenses/:yearMonth/total', getExpensesTotalDlg);

api.path('GET', '/categories', getCategoriesDlg);

api.path('GET', '/stats/expensesPerMonth', getExpensesPerMonth);
api.path('GET', '/stats/expensesPerDay', getExpensesPerDay);
api.path('GET', '/stats/expensesOfWeek', getExpensesOfWeek);
api.path('GET', '/stats/topCategoriesPerMonth', getTopCategoriesPerMonth);
api.path('GET', '/stats/topCategoriesOfMonth', getTopCategoriesOfMonth);

api.listen();
