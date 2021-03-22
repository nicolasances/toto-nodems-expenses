
exports.mongoUrl = "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PWD + "@" + process.env.MONGO_HOST + ":27017/expenses";

exports.dbName = 'expenses';
exports.collections = {
    expenses: 'expenses', 
    categories: 'categories', 
    food: 'food', 
    meals: 'meals', 
    settings: 'settings', 
    cron: 'cron'};

exports.exchangeRateUrl = 'https://v3.exchangerate-api.com/pair/4c53838ecdaca2a7f1849fb3'
