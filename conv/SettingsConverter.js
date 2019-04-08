var config = require('../config');
var moment = require('moment-timezone');
var getExchangeRateDlg = require('../dlg/GetExchangeRateDelegate')

/**
 * Updates the settings
 */
exports.update = function(data) {

  return new Promise((s, f) => {

    let upd = {};

    if (data.currency) upd.currency = parseInt(data.currency);

    s({$set: upd});

  });

}
