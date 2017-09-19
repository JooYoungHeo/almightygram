const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const mongooseUrl = 'localhost/test';

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${mongooseUrl}`, {useMongoClient: true});

let models = {};

fs.readdirSync(__dirname).filter(file => {
  return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(file => {
  let model = require(path.join(__dirname, file));
  models[model.modelName] = model;
});

module.exports = models;
