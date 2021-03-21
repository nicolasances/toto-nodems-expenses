const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.AUTHORIZED_CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}


exports.do = (req) => {

  return new Promise((success, failure) => {
    
      let errors = [];
      let promises = [];
    
      let authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) authorizationHeader = req.headers['Authorization'];
    
      if (!authorizationHeader) errors.push('No Authorization provided!');
    
      if (authorizationHeader) {
    
        let token = authorizationHeader.substring('Bearer'.length + 1);
    
        let promise = verify(token).catch((e) => {
          console.log("The validation of the token has failed!");
          console.log(e);
          errors.push("Invalid Authorization token");
        });
    
        promises.push(promise);
      }
    
      if (req.headers['x-correlation-id'] == null) errors.push('x-correlation-id is a mandatory header');
    
      Promise.all(promises).then(() => {
    
        if (errors.length > 0) success({ errors: errors });
      
        success({ errors: null });
    
      })

  });


}
