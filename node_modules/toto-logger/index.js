
var moment = require('moment-timezone');


class Logger {

  constructor(apiName) {

    this.apiName = apiName;

  }

  /**
   * This method logs an incoming call to an API path
   */
  apiIn(correlationId, method, path, msgId) {

    let ts = moment().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');

    console.info('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - [api-in] - [info] - Received HTTP call ' + method + ' ' + path);

  }

  /**
   * This method logs an outgoing call to an API
   */
  apiOut(correlationId, microservice, method, path, msgId) {

    let ts = moment().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');

    console.info('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - [api-out:' + microservice + '] - [info] - Performing HTTP call ' + method + ' ' + path);

  }

  /**
  * This method logs an incoming message received from Kafka
  */
  eventIn(correlationId, topic, msgId) {

    let ts = moment().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');

    console.info('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - [event-in] - Received event from topic ' + topic);

  }

  /**
  * This method logs an outgoing message sent to a Kafka topic
  */
  eventOut(correlationId, topic, msgId) {

    let ts = moment().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');

    console.info('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - [event-out] - Sending event to topic ' + topic);

  }

  /**
   * This method logs a generic message
   * Log level can be 'info', 'debug', 'error', 'warn'
   */
  compute(correlationId, message, logLevel) {

    let ts = moment().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss.SSS');

    if (logLevel == 'info') console.info('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - ' + message);
    else if (logLevel == 'error') console.error('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - ' + message);
    else if (logLevel == 'warn') console.warn('[' + ts + '] - [' + correlationId + '] - [' + this.apiName + '] - ' + message);

  }
}

module.exports = Logger;
