let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;
let path = require('path');
let {Subway} = require(path.join(process.cwd(), 'models'));

const bot = new Telebot(token);

bot.on('text', (msg) => {
  return find().then(result => {
    return bot.sendMessage(msg.from.id, JSON.stringify(result));
  }).catch(err => {
    return bot.sendMessage(msg.from.id, err);
  });
});

function find() {
  return new Promise((resolve, reject) => {
    Subway.find().exec((err, item) => {
      err? reject(err): resolve(item[0].downTrain.timetable);
    });
  });
}

bot.start();
