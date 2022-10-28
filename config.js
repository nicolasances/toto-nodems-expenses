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

    load() {

        console.log("Loading configuration...");

        return new Promise((success, failure) => {

            let promises = [];

            promises.push(client.accessSecretVersion({ name: 'projects/' + process.env.GCP_PID + '/secrets/toto-client-id-google/versions/latest' }).then(([version]) => {

                this.clientIDGoogle = version.payload.data.toString();

                console.log(`Retrieved Google Client ID: ${this.clientIDGoogle}`);
            }));

            // promises.push(client.accessSecretVersion({ name: 'projects/' + process.env.GCP_PID + '/secrets/toto-client-id-firebase/versions/latest' }).then(([version]) => {
            //     this.clientIDFirebase = version.payload.data.toString();
            // }));

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
        "google": this.clientIDGoogle
    }
}
}

exports.config = new Config();