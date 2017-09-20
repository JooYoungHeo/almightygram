let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;
let path = require('path');
let {Subway} = require(path.join(process.cwd(), 'models'));

const bot = new Telebot(token);

bot.on('text', (msg) => {
  return find(msg.text).then(result => {
    return bot.sendMessage(msg.from.id, JSON.stringify(result));
  }).catch(err => {
    return bot.sendMessage(msg.from.id, err);
  });
});

function find(station) {
  return new Promise((resolve, reject) => {
    Subway.find({
      'station': station
    }).exec((err, item) => {
      if (err) reject(err);
      if (item.length === 0) {
        resolve('정보가 없습니다');
      } else {
        resolve(item[0].downTrain.timetable);
      }
    });
  });
}

bot.start();
