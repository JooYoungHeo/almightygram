const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let stationSchema = new Schema({
  _id: String,
  line: String,
  stationName: String,
  type: String
});

module.exports = mongoose.model('Station', stationSchema);
