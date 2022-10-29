let { googleAuthCheck } = require('./GoogleAuthCheck');
let { fbAuthCheck } = require('./FBAuthCheck');
let { appleAuthCheck } = require('./AppleAuthCheck');
const { customAuthCheck } = require('./CustomAuthCheck');

class Validator {

  /**
   * 
   * @param {object} props Propertiess
   * @param {object} authorizedClientIDs an object that specifies the different client IDs for the different auth providers. Should be an {"google": <clientID>, "apple": <clientID>, "fb": <clientID>, ...}
   * @param {object} logger the toto logger
   * @param {object} customAuthVerifier a custom auth verifier
   */
  constructor(props, authorizedClientIDs, logger, customAuthVerifier) {
    this.props = props ? props : {};
    this.authorizedClientIDs = authorizedClientIDs;
    this.logger = logger;
    this.customAuthVerifier = customAuthVerifier;
  }

  validate(req) {

    return new Promise((success, failure) => {

      let errors = [];
      let promises = [];

      // Extraction of the headers
      // Authorization
      let authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) authorizationHeader = req.headers['Authorization'];

      // Auth Provider
      let authProviderHeader = req.headers['auth-provider'];

      // Correlation ID 
      let cid = req.headers['x-correlation-id']

      // App Version
      let appVersion = req.headers['x-app-version'];

      // Checking authorization
      // If the config doesn't say to bypass authorization, look for the Auth header
      if (this.props.noAuth == null || this.props.noAuth == false) {

        if (!authorizationHeader) errors.push('No Authorization provided!');

        if (authorizationHeader) {

          // Google check
          // If no auth provider is passed, Google is assumed
          if (authProviderHeader == 'google' || !authProviderHeader) {

            if (!this.authorizedClientIDs['google']) errors.push("No Google Client ID provided!");

            let promise = googleAuthCheck(cid, req.headers, this.authorizedClientIDs['google'], this.logger).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);

          }
          // Facebook check
          else if (authProviderHeader == 'fb') {

            if (!this.authorizedClientIDs['fb']) errors.push("No Facebook Client ID provided!");

            let promise = fbAuthCheck(cid, authorizationHeader, this.authorizedClientIDs['fb'], this.logger).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);
          }
          // Apple check
          else if (authProviderHeader == 'apple') {

            if (!this.authorizedClientIDs['apple']) errors.push("No Apple Client ID provided!");

            let promise = appleAuthCheck(cid, authorizationHeader, this.authorizedClientIDs['apple'], this.logger).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);

          }
          // Custom Authorization provider
          else {

            let promise = customAuthCheck(cid, authorizationHeader, this.customAuthVerifier, this.logger).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);

          }
        }
      }

      // Checking Correlation ID
      if (this.props.noCorrelationId == null || this.props.noCorrelationId == false) {

        if (cid == null) errors.push('No Correlation ID provided');

      }

      // Checking minimum app version
      // The minimum app version must be in the format major.minor.patch
      if (this.props.minAppVersion) {

        if (appVersion && appVersion < this.props.minAppVersion) errors.push({code: 'app-version-not-compatible', message: "The App Version is not compatible with this API"})
      }

      Promise.all(promises).then((values) => {

        if (errors.length > 0) {

          success({ errors: errors });

          errors.forEach((error) => {
            this.logger.compute(cid, "TotoAPIController - Validator - Error: " + error, 'error');
          })

        }
        else {
          if (values && values.length > 0) {
            for (let i = 0; i < values.length; i++) {
              if (values[i] && values[i].userContext) success({ errors: null, userContext: values[i].userContext });
            }
          }
          else success({ errors: null });
        }

      })

    });
  }
}

module.exports = Validator;