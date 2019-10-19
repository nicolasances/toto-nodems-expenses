var config = require('../config');
var moment = require('moment-timezone');
var getExchangeRateDlg = require('../dlg/GetExchangeRateDelegate')

/**
 * Updates the expense with the provided data
 */
exports.updateExpense = function(data) {

  return new Promise((s, f) => {

    let upd = {};

    if (data.date) {
      upd.date = parseInt(data.date);
      upd.yearMonth = upd.date.substring(0, 6);
    }
    if (data.category) upd.category = data.category;
    if (data.description) upd.description = data.description;
    if (data.yearMonth) upd.yearMonth = parseInt(data.yearMonth);
    if (data.additionalData) upd.additionalData = data.additionalData;
    if (data.consolidated != null) upd.consolidated = data.consolidated;
    if (data.weekendId) upd.weekendId = data.weekendId;
    if (data.clearWeekendId) upd.weekendId = null;

    if (data.amount && data.currency) {
      upd.amount = parseFloat(data.amount);
      upd.currency = data.currency;

      if (data.currency != 'EUR') {
        getExchangeRateDlg.getExchangeRate(data.currency).then(function(rate) {
          upd.amountInEuro = rate * parseFloat(data.amount);

          s({$set: upd});
        });
      }
      else {
        upd.amountInEuro = parseFloat(data.amount);

        s({$set: upd});
      }
    }
    else s({$set: upd});

  });

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

  // User filter is now mandatory
  let userFilter = {user: filter.user};

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
  if (filter.dateGte != null) dateGteFilter = {date: {$gte: parseInt(filter.dateGte)}};

  // Tag filters
  // Tag is expected as tagName:tagValue
  // It will be looked in the "additionalData" field
  var tagFilter = {};
  if (filter.tag) {

    let splittedFilter = filter.tag.split(":");
    let tagName = "additionalData." + splittedFilter[0];
    let tagValue = splittedFilter[1];

    tagFilter = JSON.parse("{\"" + tagName + "\": \"" + tagValue + "\"}");

  }

  return {$and: [userFilter, yearMonthFilter, categoryFilter, cardFilter, cardMonthFilter, currencyFilter, dateGteFilter, tagFilter]};

}

/**
 * Converts the provided mongodb json object into a TO
 */
exports.expenseTO = function(data) {

  if (data == null) return {};

  return {
    id: data._id,
    amount: data.amount,
    category: data.category,
    date: moment(data.date, 'YYYYMMDD').format('YYYYMMDD'),
    description: data.description,
    yearMonth: data.yearMonth,
    consolidated: data.consolidated,
    cardId: data.cardId,
    cardMonth: data.cardMonth,
    cardYear: data.cardYear,
    weekendId: data.weekendId,
    currency: data.currency,
    amountInEuro: data.amountInEuro,
    additionalData: data.additionalData,
    user: data.user
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
          amountInEuro: rate * parseFloat(data.amount),
          additionalData: data.additionalData,
          user: data.user
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
        amountInEuro: parseFloat(data.amount),
        additionalData: data.additionalData,
        user: data.user
      });
    }

  });

}
