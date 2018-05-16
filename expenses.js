var express = require('express');
var Promise = require('promise');
var bodyParser = require("body-parser");
var logger = require('toto-apimon-events')

var putExpenseDlg = require('./dlg/PutExpenseDelegate');
var postExpenseDlg = require('./dlg/PostExpenseDelegate');
var getExpensesTotalsDlg = require('./dlg/GetExpensesTotalsDelegate');
var getExpensesTotalDlg = require('./dlg/GetExpensesTotalDelegate');
var getExpensesDlg = require('./dlg/GetExpensesDelegate');
var getExpenseDlg = require('./dlg/GetExpenseDelegate');
var getCategoriesDlg = require('./dlg/GetCategoriesDelegate');
var deleteExpenseDlg = require('./dlg/DeleteExpenseDelegate');

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, GoogleIdToken");
  res.header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
  next();
});
app.use(bodyParser.json());

app.get('/', function(req, res) {res.send({status: 'running'});});
app.get('/expenses', function(req, res) {
  logger.apiCalled('expenses', '/expenses', 'GET', req.query, req.params, req.body);
  getExpensesDlg.getExpenses({yearMonth: req.query.yearMonth, maxResults: req.query.maxResults, category: req.query.category, cardId: req.query.cardId, cardMonth: req.query.cardMonth, currency: req.query.currency}, {sortDate: req.query.sortDate, sortAmount: req.query.sortAmount, sortYearMonth: req.query.sortYearMonth, sortDesc: req.query.sortDesc}).then(function(result) {res.send(result);});
});
app.post('/expenses', function(req, res) {logger.apiCalled('expenses', '/expenses', 'POST', req.query, req.params, req.body); postExpenseDlg.Expense(req.body).then(function(result) {res.send(result);});});
app.delete('/expenses/:id', function(req, res) {logger.apiCalled('expenses', '/expenses/:id', 'DELETE', req.query, req.params, req.body); deleteExpenseDlg.deleteExpense(req.params.id).then(function(result) {res.send(result);});});
app.get('/expenses/:id', function(req, res) {logger.apiCalled('expenses', '/expenses/:id', 'GET', req.query, req.params, req.body); getExpenseDlg.getExpense(req.params.id).then(function(result) {res.send(result);});});
app.put('/expenses/:id', function(req, res) {logger.apiCalled('expenses', '/expenses/:id', 'PUT', req.query, req.params, req.body); putExpenseDlg.putExpense(req.params.id, req.body).then(function(result) {res.send(result);});});
app.get('/expenses/totals', function(req, res) {logger.apiCalled('expenses', '/expenses/totals', 'GET', req.query, req.params, req.body); getExpensesTotalsDlg.getExpensesTotals({maxResults: req.query.maxResults, currentYearMonth: req.query.currentYearMonth, currency: req.query.currency}).then(function(result) {res.send(result);});});
app.get('/expenses/:yearMonth/total', function(req, res) {logger.apiCalled('expenses', '/expenses/:yearMonth/total', 'GET', req.query, req.params, req.body); getExpensesTotalDlg.getExpensesTotal({yearMonth: req.params.yearMonth, currency: req.query.currency}).then(function(result) {res.send(result);});});
app.get('/categories', function(req, res) {logger.apiCalled('expenses', '/categories', 'GET', req.query, req.params, req.body); getCategoriesDlg.getCategories().then(function(result) {res.send(result);});});

app.listen(8080, function() {
  console.log('Expenses Microservice up and running');
});
