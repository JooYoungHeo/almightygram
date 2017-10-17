let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;
let path = require('path');
let fs = require('fs');
let lineDirName = 'lines';
let {StationTimeInfo} = require(path.join(process.cwd(), 'models'));

const bot = new Telebot(token);

bot.on('text', (msg) => {
  return find(msg.text).then(result => {
    for (let i in result) {
      let infoList = refineData(result[i].subways);
      bot.sendMessage(msg.from.id, `${result[i]._id} ${result[i].subways[0].stationName}`)
      for (let j in infoList) {
        bot.sendMessage(msg.from.id, infoList[j]);
      }
    }
    return;
  }).catch(err => {
    console.error(err);
    return bot.sendMessage(msg.from.id, '뭔가 잘못되었다.');
  });
});

bot.start();

function find(station) {
  let day = getDayInfo();
  return new Promise((resolve, reject) => {
    StationTimeInfo.aggregate(
      [{
        $match: {
          dailyType: day,
          $or: [{stationName: station},
            {stationName: `${station}역`},
            {abbreviation: station},
            {abbreviation: `${station}역`}]
        }
      }, {
        $group: { _id: '$line', subways: {$push: '$$ROOT'}}
      }]
    ).exec((err, item) => {
      err? reject(err): resolve(item);
    });
  });
}

function refineData(items) {
  let infoList = [];

  for (let i in items) {
    let item = items[i];
    let nextStation = getNextStation(item.line, item.stationName, item.upDownType);
    let info = getInfo(item.timeTable);
    let remainTime = (info.remainText !== undefined)? info.remainText: '';
    let endStName = (info.endStationName !== undefined)? info.endStationName: '';
    infoList.push(` - ${nextStation} 방면 : ${remainTime} (${endStName})`);
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
      returnValue = {endStationName: `${item.endStationName}행`, remainText: convertRemainTime(time, item.depTime)};
      break;
    }
  }

  return returnValue;
}

function formattingTime(d) {
  return (d < 10)? '0' + d.toString(): d.toString();
}

function getDayInfo() {
  let day = new Date().getDay();
  return (day === 0)? '03': (day === 6)? '02': '01';
}

function convertRemainTime(now, dep) {
  let remainTime = convertStringToTime(dep) - convertStringToTime(now);
  let hourText = (remainTime > 3600)? `${Math.floor(remainTime/3600)}시간`:'';
  remainTime %= 3600;
  let minuteText = (remainTime > 60)? `${Math.floor(remainTime/60)}분`:'';
  remainTime %= 60;
  let secondText = `${remainTime}초`;

  return `${hourText}${minuteText}${secondText} 후 출발`;
}

function convertStringToTime(time) {
  let hour = time.slice(0,2);
  let minute = time.slice(2,4);
  let second = time.slice(4,6);
  return Number(hour * 3600) + Number(minute * 60) + Number(second);
}

function getNextStation(line, stationName, upDownType) {
  let stList = fs.readFileSync(`${lineDirName}/${line}.txt`, 'utf-8').split('\n');

  stList.pop();

  let index = stList.indexOf(stationName);
  let nextIndex = (upDownType === 'U')? index + 1: index - 1;

  return (stList[nextIndex] === undefined)? stList[index]: stList[nextIndex];
}
