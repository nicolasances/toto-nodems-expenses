let http = require('request');

exports.verifyToken = (endpoint, token, cid) => {

    return new Promise((success, failure) => {

        http({
            uri: endpoint + '/verify',
            method: 'POST',
            headers: {
                'x-correlation-id': cid, 
                'Authorization': `Bearer ${token}`
            }
        }, (err, resp, body) => {

            if (err) {
                console.log(err)
                failure(err);
            }
            else success(JSON.parse(body));

        })

    })
}