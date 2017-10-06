let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;
let path = require('path');
let {Subway} = require(path.join(process.cwd(), 'models'));

const bot = new Telebot(token);

let dayTypeList = ['WD', 'SD', 'HD'];

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
    let timeList = item[i].timeTable;
    let answer = refineTimeList(timeList);

    infoList.push(`${line} ${station} / ${answer}`);
  }
  return infoList;
}

function refineTimeList(timeList) {
  let day = getDay();
  let timeObject = timeList[day];
  let timetable = timeObject[dayTypeList[day]];
  let directionKeys = Object.keys(timetable);
  let answerList = [];

  for (let i in directionKeys) {
    let schedule = timetable[directionKeys[i]];
    let answer = getTime(schedule);
    answerList.push(`${directionKeys[i]}:${answer}분 후`);
  }

  return answerList.join(' / ');
}

function getTime(schedule) {
  let date = new Date();
  let hour = formattingTime(date.getHours());
  let nextHour = formattingTime(date.getHours() + 1);
  let nowMinute = date.getMinutes();
  let minutes = schedule[hour];
  let nextMinutes = schedule[nextHour];
  let flag = false;
  let returnValue = 0;

  for (let i in minutes) {
    if (Number(minutes[i][0]) > nowMinute) {
      returnValue = Number(minutes[i][0]) - nowMinute;
      flag = true;
      break;
    }
  }

  if (!flag) {
    returnValue = Number(nextMinutes[0][0]) + 60 - nowMinute;
  }

  return returnValue;
}

function formattingTime(d) {
  return (d < 10)? '0' + d.toString(): d.toString();
}

function getDay() {
  let day = new Date().getDay();
  return (day === 0)? 2: (day === 6)? 1: 0;
}

//todo : 시간값 리턴에 행선지 붙이기, 데이터 파싱 다시하기, 마지막 시간 후 에러처리 추가
