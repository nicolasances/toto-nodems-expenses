let request = require('request');
let moment = require('moment-timezone');

// Facebook has a throttling mechanism, so I have to cache tokens and user info to avoid being blocked
class FBCache {

    constructor() {
        this.cache = new Map();
    }

    put(token, userContext) {
        this.cache.set(token, { userContext: userContext, expiry: parseInt(moment().add(10, 'm').format('YYYYMMDDHHmm')) });
    }

    get(token) {

        let cachedData = this.cache.get(token);
        let currentTime = parseInt(moment().format('YYYYMMDDHHmm'));
        
        if (!cachedData) return null;
        
        if (currentTime > cachedData.expiry) return null;

        return cachedData.userContext;

    }
}

const cache = new FBCache();

exports.fbAuthCheck = (cid, authorizationHeader, authorizedClientId, logger) => {

    return new Promise((success, failure) => {

        let token = authorizationHeader.substring('Bearer'.length + 1);
        
        // Check if the token is cached first! 
        let cachedUserContext = cache.get(token);
        
        if (cachedUserContext) { logger.compute(cid, 'FB auth: using cached user context', 'info'); success(cachedUserContext); return; }

        request.get({ url: "https://graph.facebook.com/v10.0/me?fields=id,email&access_token=" + token }, (err, response, body) => {


            let result = JSON.parse(body);

            if (result.id) {

                let userContext = {
                    userId: result.id,
                    email: result.email,
                    authProvider: 'fb'
                };

                cache.put(token, userContext);

                success(userContext);
            }
            else {
                logger.compute(cid, result.error.message, 'error')
                failure(result.error.message);
            }

        });

    });
}