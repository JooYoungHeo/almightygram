let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;
let path = require('path');
let {StationTimeInfo} = require(path.join(process.cwd(), 'models'));

const bot = new Telebot(token);

let dayTypeList = ['WD', 'SD', 'HD'];

bot.on('text', (msg) => {
  return find(msg.text).then(result => {
    let infoList = refineData(result);
    for (let i in infoList) {
      bot.sendMessage(msg.from.id, infoList[i]);
    }
    return;
  }).catch(err => {
    console.error(err);
    return bot.sendMessage(msg.from.id, '뭔가 잘못되었다.');
  });
});

bot.start();

function find(station) {
  return new Promise((resolve, reject) => {
    StationTimeInfo.find({
      $or: [{'stationName': station},
            {'stationName': `${station}역`},
            {'abbreviation': station},
            {'abbreviation': `${station}역`}]
    }).exec((err, item) => {
      err? reject(err): resolve(item);
    });
  });
}

function refineData(items) {
  let infoList = [];

  for (let i in items) {
    let item = items[i];
    let info = getInfo(item.timeTable);
    let remainTime = (info.depTime !== undefined)? info.depTime: '';
    let endStName = (info.endStationName !== undefined)? info.endStationName: '';
    infoList.push(`${item.line} ${item.stationName} - ${item.upDownType} : ${remainTime} (${endStName})`);
  }

  return infoList;
}

function getInfo(timeList) {
  let date = new Date();
  let hour = formattingTime(date.getHours());
  let minute = formattingTime(date.getMinutes());
  let second = formattingTime(date.getSeconds());
  let time = hour + minute + second;
  let returnValue = {};

  for (let i in timeList) {
    let item = timeList[i];
    if (Number(time) < Number(item.depTime)) {
      returnValue = item;
      break;
    }
  }

  return returnValue;
}

function formattingTime(d) {
  return (d < 10)? '0' + d.toString(): d.toString();
}
