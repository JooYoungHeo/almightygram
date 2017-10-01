const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let subwaySchema = new Schema({
  line: String,
  station: String,
  timeTable: Schema.Types.Mixed,
  abbreviation: String,
  type: String
});

module.exports = mongoose.model('Subway', subwaySchema);
