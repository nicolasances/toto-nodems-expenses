const appleSignin = require('apple-signin-auth');

exports.appleAuthCheck = (cid, authorizationHeader, authorizedClientId, logger) => {

    return new Promise((success, failure) => {

        let token = authorizationHeader.substring('Bearer'.length + 1);

        const clientId = authorizedClientId;

        appleSignin.verifyIdToken(token, {
            audience: clientId,
            ignoreExpiration: true, // ignore token expiry (never expires)
        }).then((payload) => {

            success({
                userId: payload.sub,
                email: payload.email,
                authProvider: 'apple'
            })

        }, (err) => {
            logger.compute(cid, err, 'error')
            failure("Invalid Authorization token");
        });

    });
}