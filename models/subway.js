const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let subwaySchema = new Schema({
  date: String,
  day: String,
  line: Number,
  station: String,
  upTrain: Schema.Types.Mixed,
  downTrain: Schema.Types.Mixed,
  exitInfo: Schema.Types.Mixed,
  busInfo: Schema.Types.Mixed
});

module.exports = mongoose.model('Subway', subwaySchema);
