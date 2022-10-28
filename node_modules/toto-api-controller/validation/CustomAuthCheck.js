const { OAuth2Client } = require('google-auth-library');

/**
 * This function allows extensions on the Toto authorization validator, by supporting custom authProvider and custom ways to verify authorization
 * @param {string} cid correlation id
 * @param {string} authorizationHeader Authorization HTTP header
 * @param {object} authorizationVerifier authorization verifier. It's an object that must have a function called verifyIdToken()
 * @param {object} logger the toto logger to use
 * @returns 
 */
exports.customAuthCheck = (cid, authorizationHeader, authorizationVerifier, logger) => {

    return new Promise((success, failure) => {

        let token = authorizationHeader.substring('Bearer'.length + 1);

        authorizationVerifier.verifyIdToken({ idToken: token }).then((result) => {

            success({
                userId: result.sub,
                email: result.email,
                authProvider: result.authProvider
            })

        }, (err) => {
            logger.compute(cid, err, 'error')
            failure("Invalid Authorization token");
        });
    });
}