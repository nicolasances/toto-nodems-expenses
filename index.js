let Controller = require('toto-api-controller');
let config = require('./config');

let putExpenseDlg = require('./dlg/PutExpenseDelegate');
let postExpense = require('./dlg/PostExpenseDelegate');
let getExpensesTotalsDlg = require('./dlg/GetExpensesTotalsDelegate');
let getExpensesTotalDlg = require('./dlg/GetExpensesTotalDelegate');
let getExpenses = require('./dlg/GetExpensesDelegate');
let getExpenseDlg = require('./dlg/GetExpenseDelegate');
let getCategoriesDlg = require('./dlg/GetCategoriesDelegate');
let deleteExpenseDlg = require('./dlg/DeleteExpenseDelegate');

let getExpensesPerDay = require('./dlg/stats/GetExpensesPerDay');
let getExpensesPerYear = require('./dlg/stats/GetExpensesPerYear');
let getExpensesPerMonth = require('./dlg/stats/GetExpensesPerMonth');
let getExpensesOfWeek = require('./dlg/stats/GetExpensesOfWeek');
let getTopCategoriesPerMonth = require('./dlg/stats/GetTopCategoriesPerMonth');
let getTopCategoriesOfMonth = require('./dlg/stats/GetTopCategoriesOfMonth');

let getSettings = require('./dlg/settings/GetSettings');
let putSettings = require('./dlg/settings/PutSettings');

let apiName = 'expenses';

let api = new Controller(apiName, config.config);

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
