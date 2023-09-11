const { verifyToken } = require('../api/AuthAPI');

class TotoAuthProvider {

    constructor({authAPIEndpoint}) {
        this.authAPIEndpoint = authAPIEndpoint;
    }

    verifyIdToken({idToken}) {

        return new Promise((success, failure) => {

            console.log("Validating custom token");

            verifyToken(this.authAPIEndpoint, idToken, null).then((result) => {

                if (!result || result.code == 400) {
                    failure(result.message);
                    return;
                }

                console.log("Custom token successfully validated");

                success({
                    sub: result.sub,
                    email: result.email,
                    authProvider: result.authProvider
                })

            })

        })

    }
}

module.exports = TotoAuthProvider;