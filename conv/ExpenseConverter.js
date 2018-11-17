var config = require('../config');
var moment = require('moment-timezone');
var getExchangeRateDlg = require('../dlg/GetExchangeRateDelegate')

/**
 * Updates the expense with the provided data
 */
exports.updateExpense = function(data) {

  if (data.consolidated != null) return {$set: {consolidated: data.consolidated}};

  if (data.weekendId != null) return {$set: {weekendId: data.weekendId}};
  if (data.clearWeekendId != null) return {$set: {weekendId: null}};

  return {$set : {category: data.category}};
}

/**
 * Sorts the expenses based on the provided sort fields
 */
exports.sortExpenses = function(sort) {

  if (sort.sortAmount == 'true') {
    if (sort.sortDesc == 'true') return {amount: -1};
    else return {amount: 1};
  }

  if (sort.sortYearMonth == 'true') {
    if (sort.sortDesc == 'true') return {yearMonth: -1};
    else return {yearMonth: 1};
  }

  if (sort.sortDate == 'true') {
    if (sort.sortDesc == 'true') return {date: -1};
    else return {date: 1};
  }

  return {};
}

/**
 * Filter expenses
 */
exports.filterExpenses = function(filter) {

  var yearMonthFilter = {};
  if (filter.yearMonth != null) yearMonthFilter = {yearMonth: parseInt(filter.yearMonth)};

  var categoryFilter = {};
  if (filter.category != null) categoryFilter = {category: filter.category};

  var cardFilter = {};
  if (filter.cardId != null) cardFilter = {cardId: filter.cardId};

  var cardMonthFilter = {};
  if (filter.cardMonth != null && filter.cardYear != null) {
    cardMonthFilter = {$and: [{cardMonth: filter.cardMonth}, {cardYear: filter.cardYear}]};
  }

  var currencyFilter = {};
  if (filter.currency != null) currencyFilter = {currency: filter.currency};

  var dateGteFilter = {};
  if (filter.dateGte != null) dateGteFilter = {$gte: {date: parseInt(filter.dateGte)}};

  console.log({$and: [yearMonthFilter, categoryFilter, cardFilter, cardMonthFilter, currencyFilter, dateGteFilter]});

  return {$and: [yearMonthFilter, categoryFilter, cardFilter, cardMonthFilter, currencyFilter, dateGteFilter]};

}

/**
 * Converts the provided mongodb json object into a TO
 */
exports.expenseTO = function(data) {

  return {
    id: data._id,
    amount: data.amount,
    category: data.category,
    date: moment(data.date, 'YYYYMMDD'),
    description: data.description,
    yearMonth: data.yearMonth,
    consolidated: data.consolidated,
    cardId: data.cardId,
    cardMonth: data.cardMonth,
    cardYear: data.cardYear,
    weekendId: data.weekendId,
    currency: data.currency,
    amountInEuro: data.amountInEuro
  };
}

/**
 * Creates a mongodb persistent expense
 */
exports.expensePO = function(data) {

  return new Promise(function(success, failure) {

    // Get the exchange rate
    if (data.currency != 'EUR') {

      getExchangeRateDlg.getExchangeRate(data.currency).then(function(rate) {

        success({
          amount: parseFloat(data.amount),
          date: parseInt(data.date),
          category: data.category,
          description: data.description,
          yearMonth: parseInt(data.yearMonth),
          consolidated: data.consolidated == 'true' ? true : false,
          cardId: data.cardId,
          cardMonth: data.cardMonth,
          cardYear: data.cardYear,
          currency: data.currency,
          amountInEuro: rate * parseFloat(data.amount)
        });
      });

    }
    else {
      success({
        amount: parseFloat(data.amount),
        date: parseInt(data.date),
        category: data.category,
        description: data.description,
        yearMonth: parseInt(data.yearMonth),
        consolidated: data.consolidated == 'true' ? true : false,
        cardId: data.cardId,
        cardMonth: data.cardMonth,
        cardYear: data.cardYear,
        currency: data.currency,
        amountInEuro: parseFloat(data.amount)
      });
    }

  });

}
