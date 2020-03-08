var moment = require('moment-timezone');

exports.cid = function() {

    // 20200308 130803 408
    let ts = moment().tz('Europe/Rome').format('YYYYMMDDHHmmssSSS');

    // -11617
    let random = (Math.random() * 100000).toFixed(0).padStart(5, '0');

    return ts + '' + random;
}