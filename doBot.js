let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;
let path = require('path');
let {Subway} = require(path.join(process.cwd(), 'models'));

const bot = new Telebot(token);

bot.on('text', (msg) => {
  return find(msg.text).then(result => {
    let infoList = refineData(result);
    for (let i in infoList) {
      bot.sendMessage(msg.from.id, JSON.stringify(infoList[i]));
    }
    return;
  }).catch(err => {
    return bot.sendMessage(msg.from.id, err);
  });
});

bot.start();

function find(station) {
  return new Promise((resolve, reject) => {
    Subway.find({
      $or: [{'station': station}, {'station': `${station}역`}]
    }).exec((err, item) => {
      if (err) reject(err);
      resolve(item);
    });
  });
}

function refineData(item) {
  let infoList = [];
  for (let i in item) {
    let line = item[i].line;
    let station = item[i].station;
    let upTrain = item[i].upTrain.timetable;
    let downTrain = item[i].downTrain.timetable;
    let upNextArrival = getTime(upTrain);
    let downNextArrival = getTime(downTrain);
    infoList.push(`${line} ${station} / 상행: ${upNextArrival}분후 도착 / 하행: ${downNextArrival}분후 도착`);
  }
  return infoList;
}

function getTime(list) {
  let date = new Date();
  let hour = formattingTime(date.getHours());
  let minute = date.getMinutes();
  let timeList = list[hour];
  let nextArraival = '';

  for (let i in timeList) {
    if (Number(timeList[i]) > minute) {
      nextArraival = Number(timeList[i]);
      break;
    }
  }
  return nextArraival - minute;
}

function formattingTime(d) {
  return (d < 10)? '0' + d.toString(): d.toString();
}
