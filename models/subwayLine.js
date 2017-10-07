const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let subwayLineSchema = new Schema({
  line: String,
  stationList: [],
  type: String
});

module.exports = mongoose.model('SubwayLine', subwayLineSchema);
