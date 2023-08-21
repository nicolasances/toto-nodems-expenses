const { verifyToken } = require('../api/AuthAPI');

class TotoAuthProvider {

    constructor({authAPIEndpoint}) {
        this.authAPIEndpoint = authAPIEndpoint;
    }

    verifyIdToken({idToken}) {

        return new Promise((success, failure) => {

            verifyToken(this.authAPIEndpoint, idToken, null).then((result) => {

                if (!result || result.code == 400) {
                    failure(result.message);
                    return;
                }

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