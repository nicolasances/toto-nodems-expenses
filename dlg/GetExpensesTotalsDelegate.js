var getExpensesTotalDlg = require('./GetExpensesTotalDelegate');
var moment = require('moment-timezone');

/**
 * Calculates a month by subtracting the passed month with the subtractMonths param
 * { maxResults: req.query.maxResults,
 *   currentYearMonth: req.query.currentYearMonth,
 *   currency: req.query.currency
 * }
 */
var getYearMonth = function(currentYearMonth, subtractMonths) {

  if (subtractMonths == 0) return currentYearMonth;

  return parseInt(moment(currentYearMonth + '01', 'YYYYMMDD').subtract(subtractMonths, 'months').format('YYYYMM'));
}

/**
 * Retrieves the list of totals for n months (specified in request.maxResults)
 */
exports.do = function(req) {

  let request = {
    maxResults: req.query.maxResults,
    currentYearMonth: req.query.currentYearMonth,
    currency: req.query.currency
  }

  return new Promise(function(success, failure) {

    var totals = [];
    var i = request.maxResults;
    var yearMonth;

    /**
     * Retrieves the total of the previous month.
     * Recursive function that will stop when the request.maxResults is reached.
     */
    var getNextTotal = function() {

      // Stop condition
      if (i == 0) {
        success({totals: totals});
        return;
      }

      // Previous month
      i--;
      yearMonth = getYearMonth(request.currentYearMonth, i);

      // Get the expenses total for that month
      getExpensesTotalDlg.getExpensesTotal({yearMonth: yearMonth, currency: request.currency}).then(function(data) {

        // Add the total to the list of totals
        totals.push({month: new Date(moment(yearMonth + '01', 'YYYYMMDD')), amount: data.total});

        // Recursively call the next total (previous month)
        getNextTotal();

      });
    }

    // Start the iteration
    getNextTotal();

  });
}
