const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Instantiates a client
const client = new SecretManagerServiceClient();

exports.mongoUrl = "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PWD + "@" + process.env.MONGO_HOST + ":27017/expenses";

exports.dbName = 'expenses';
exports.collections = {
    expenses: 'expenses',
    categories: 'categories',
    food: 'food',
    meals: 'meals',
    settings: 'settings',
    cron: 'cron'
};

exports.exchangeRateUrl = 'https://v3.exchangerate-api.com/pair/4c53838ecdaca2a7f1849fb3'

class Config {

    googleAuthorizedClientIDs = {}

    load() {

        console.log("Loading configuration...");

        return new Promise((success, failure) => {

            let promises = [];

            promises.push(client.accessSecretVersion({ name: 'projects/' + process.env.GCP_PID + '/secrets/client-id-google-toto-money-ios/versions/latest' }).then(([version]) => {

                this.googleAuthorizedClientIDs.totoMoneyiOS = version.payload.data.toString();

            }));

            promises.push(client.accessSecretVersion({ name: 'projects/' + process.env.GCP_PID + '/secrets/client-id-google-toto-money-web/versions/latest' }).then(([version]) => {

                this.googleAuthorizedClientIDs.totoMoneyWeb = version.payload.data.toString();

            }));

            Promise.all(promises).then(() => {
                console.log("Configuration Loaded!");
                success()
            }, failure);

    })

}

getProps() {
    return {
        noCorrelationId: false,
        noAuth: false
    }
}

getAuthorizedClientIDs() {
    return {
        "google": this.googleAuthorizedClientIDs
    }
}
}

exports.config = new Config();