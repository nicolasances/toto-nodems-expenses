# Toto API Controller
The Toto API Controller is a façade to expressJS to make it easier building an API.

The complete documentation of each version is here: 
 * [Version 10.0.0](docs/10.0.0.md)
 * [Version 9.5.0](docs/9.5.0.md)

---
Once started, the API Controller will listen on port 8080. <br/>
It will also publish the following endpoints:
 * `GET /`          - Health check of the API
 * `GET /publishes` - Endpoint to get the list of published events
 * `GET /consumes`  - Endpoint to get the list of consumed events

This API Controller will also log following the standard Toto Logging policies.<br/>
See https://github.com/nicolasances/node-toto-logger

## Major release 10.0.0
Now requires the `getAuthorizedClientIDs()` method to return, for the "google" key, an object mapping different applications to their client ID.<br>
For more info, see [the documentation on Version 10.0.0](docs/10.0.0.md)

## Minor release: 9.5.0
Now supports providing a different `Content-Type` on `streamGET` paths. 

To do that, just pass an options object in the following way: 
```
api.streamGET('/path/to/pdf/stream', getMyPDF, { contentType: "application/pdf" });
```

## Minor release: 9.4.0
Now supports validating the `x-app-version` header. 

To do that, in your `Config` class, in the `getProps()` method, you can pass a `minAppVersion` field (string, in the format major.minor.patch), like this: 
```
    getProps() {
        return {
            noCorrelationId: true, 
            minAppVersion: "0.16.0" <- you can do this or use something you have loaded from a configuration or secret
        }
    }
```

If the `minAppVersion` field is passed, the controller will automatically check the provided `x-app-version` header and if lower than the min app version, a validation error will be provided, that looks like this: <br>
`{code: 'app-version-not-compatible', message: "The App Version is not compatible with this API"}`

**Note**: if the `x-app-version` header is not provided, the controller will not block the request. Clients that do not provide that header are expected to be able to run on the latest version of the backend APIs they are calling.

## Minor release: 9.3.0
Now supports `x-app-version`. <br>
This gives clients (apps) the opportunity to provide the app version so that the backend can block old apps from using specific API versions.

The app version is now provided as a field in the `executionContext` when the API delegate is called.<br>
The cid is also provided: 
```
executionContext.cid = req.headers['x-correlation-id']; 
executionContext.appVersion = req.headers['x-app-version'];
```

## Major release: 9.0.0
**Now supporting Apple login!**

Other breaking changes: now the `Config` class needs to provide a `getAuthorizedClientIDs()` method, that will return an object `{"google": "clientID", "apple", "clientID", etc..}`
```
class Config {

    load() {
        ...
    }

    getAuthorizedClientIDs() {
        return {
            "google": this.googleClientID, 
            "apple": this.appleClientID, 
            "fb": this.fbClientID
        }
    }

}
```
This replaces the previous methods `getAuthorizedClientId()`, `getAuthorizedFBClientId()`, etc..

## Major release: 8.0.0
**Now supporting custom Auth Providers!!**<br/>
How does that work? 
Now you `config` can provide a `getCustomAuthVerifier` function. That function will need to return an `object` with a function called `verifyIdToken` that given an `idToken` will be able to verify it's validity. 

Let's look at an example of your new config file, when using a custom auth provider: 
```
class Config {

    load() {
        ...
    }

    getCustomAuthVerifier() {
        return {
            verifyIdToken: function({idToken}) {

                return new Promise((success, failure) => {

                    // Here verify the the validity of the received idToken
                    // .... 

                    // Now return the results
                    success({
                        userId: ...,
                        email: ...,
                        authProvider: ...
                    })

                    // Or fail
                    failure(error);
                })
            }
        }
    }
}
```

## Minor release: 7.6.0
Now the controller passes an `executionContext` object to the delegate. <br/>
That object containes an instance of `Logger` which can be used to log messages with contextual information, like the name of the microservice, etc..

**ATTENTION**: Logger is a class, not an object anymore!

## Minor release: 7.1.0
It is now possible to configure properties such as: 
 * `noAuth` - set to `true` to bypass the authorization checks
 * `noCorrelationId` - set to `true` to accept HTTP calls without a correlation ID

The config object can now (optionally) provide a `getProps()` function that must return an object with the fields above... and probably more to come soon :) 

## Major update: 7.0.0
Now the auth check also supports **Facebook** on top of Google auth. <br/>
To do that, the `Config` class also needs to provide: 
 * `getAuthorizedFBClientId()` - a function that will return the FB app id that is authorized to call this microservice.

 Another update is that now, to avoid redundant call to the auth providers to get user profile from a (access or id) token, the api controller will provide a `userContext` object that will contain the basic user profile. 

 That means that when **delgates** receive a call to their `do()` method, they will receive: 
  * `req` - the HTTP request, as always
  * `userContext` - an object that contains: 
    * `userId` - the auth provider specific user ID (e.g. google user id, or facebook user id)
    * `email` - the user email

So when you create a delegate your signature will look like this, if you want the user context: 
```
exports.do = function (request, userContext) {
    ...
}
```

## Major update: 6.0.0
In this version the following major changes have been made: 
 * **Config**: now a Config object has to be passed to the Controller. This config **must** provide two methods:
   * `load()` - an asynchronous function to load the configuration of the microservice, that will return a Promise
   * `getAuthorizedClientId()` - a function that will return the authorized client id, used to verify that the client app calling the microservice is authorized to do so. *Note that this used to be provided as an Environment Variable, but is now expected out of the config object. This was chosen for a better security.* 
 * **Streaming**: you can now stream files as a response!

## Authorization check
This Controller performs a few mandatory checks on the requests. 

One of those checks is to verify that the provided Authorization header is passed and only the authorized CLIENT is able to access this API. 

**IMPORTANT**: 
This authorized client ID has to be provided by the `getAuthorizedClientId()` method of the `config` object passed in the constructor of this controller.

## How to use it
1. Include it:
```
var Controller = require('toto-api-controller');
```
2. Instantiate it
```
var api = new Controller('api-name', config eventProducer, eventConsumer);
```
The constructor takes the following arguments:
 * **`apiName`**         mandatory, the name of the microservice (e.g. training-session)
 * **`config`** mandatory, the configuration object that will provide the two methods specified above.
 * **`eventProducer`**   optional, the Toto Event Producer (see https://github.com/nicolasances/node-toto-event-publisher) if this API publishes events
 * **`eventConsumer`**   optional, the Toto Event Consumer (see https://github.com/nicolasances/node-toto-event-consumer) if this API consumes events
3. Start it
```
api.listen()
```

## Example
An example of usage:
```
let Controller = require('toto-api-controller');
let config = require('./Config');

let api = new Controller('training-session', config.config, totoEventPublisher);

// APIs
api.path('GET', '/sessions', getSessions);
api.path('POST', '/sessions', postSession);

api.path('GET', '/sessions/:id', getSession);
api.path('DELETE', '/sessions/:id', deleteSession);

api.path('GET', '/sessions/:id/exercises', getSessionExercises);
api.path('POST', '/sessions/:id/exercises', postSessionExercise);

api.path('GET', '/sessions/:id/exercises/:eid', getSessionExercise);
api.path('PUT', '/sessions/:id/exercises/:eid', putSessionExercise);
api.path('DELETE', '/sessions/:id/exercises/:eid', deleteSessionExercise);

api.listen();
```

## Example of Config
```
// Imports the Secret Manager library
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Instantiates a client
class Config {

    load() {

        return new Promise((success, failure) => {

            // Load your configurations here .... 
            // ....

            // Among those load the authorizedClientId
            this.authorizedClientId = ...

            success();

        })
    }

    getAuthorizedClientId() {
        return this.authorizedClientId;
    }
}

exports.config = new Config();
```

## Streaming files as a response
To provide an API that streams a file back to the calling client a method is provided in the controller to register that path: `streamGET(path, delegate)`

This method requires two arguments: 
 * `path` - the path to register (like the `path()` method of this controller)
 * `delegate` - the delegate that is going to process the request. The delegate **must** provide a `do()` method (like other delegates used in the `path()` registration) and this method **must** return a `Promise`, which **must** return a `ReadableStream` (see https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

## Registering static content
To provide access to static content (folders) in your service, use the `staticContent()` method:
```
api.staticContent(path, folder)
```
For example:
```
api.staticContent('/img', '/app/img');
```
Note that the folder is **an ABSOLUTE folder** 
