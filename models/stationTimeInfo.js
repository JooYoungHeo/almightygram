const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let stationTimeInfoSchema = new Schema({
  line: String,
  stationName: String,
  stationId: String,
  timeTable: Schema.Types.Mixed,
  abbreviation: String,
  dailyType: String,
  upDownType: String,
  type: String
});

module.exports = mongoose.model('StationTimeInfo', stationTimeInfoSchema);
