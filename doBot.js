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
      $or: [{'station': station},
            {'station': `${station}역`}, 
            {'abbreviation': station},
            {'abbreviation': `${station}역`}]
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
    let answer = getTimeAndDest(schedule);
    let dest = (answer.dest === '-')? '': answer.dest;
    let mention = (answer.remainTime === '')? '도착정보가 없습니다': `${answer.remainTime}분 후 ${dest}`;
    answerList.push(`${directionKeys[i]}:${mention}`);
  }

  return answerList.join(' / ');
}

function getTimeAndDest(schedule) {
  let date = new Date();
  let hour = formattingTime(date.getHours());
  let nextHour = formattingTime(date.getHours() + 1);
  let nowMinute = date.getMinutes();
  let minutes = schedule[hour];
  let nextMinutes = schedule[nextHour];
  let flag = false;
  let remainTime = '';
  let dest = '-';

  if (minutes === undefined) return {remainTime: remainTime, dest: dest};

  for (let i in minutes) {
    if (Number(minutes[i][0]) > nowMinute) {
      remainTime = Number(minutes[i][0]) - nowMinute;
      dest = minutes[i][1];
      flag = true;
      break;
    }
  }

  if (!flag && (nextMinutes !== undefined)) {
    remainTime = Number(nextMinutes[0][0]) + 60 - nowMinute;
    dest = nextMinutes[0][1];
  }

  return {remainTime: remainTime, dest: dest};
}

function formattingTime(d) {
  return (d < 10)? '0' + d.toString(): d.toString();
}

function getDay() {
  let day = new Date().getDay();
  return (day === 0)? 2: (day === 6)? 1: 0;
}
