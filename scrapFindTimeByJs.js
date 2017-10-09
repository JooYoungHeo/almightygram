let cheerio = require('cheerio');
let request = require('request');
let path = require('path');
let fs = require('fs');
let {Subway} = require(path.join(process.cwd(), 'models'));

let dayTypeList = ['WD', 'SD', 'HD']; // wd: weekday, sd: saturday, hd: holiday
let dayList = ['평일', '토요일', '일요일'];

let file = fs.readFileSync('3LineHref.txt', 'utf-8');
let hrefList = file.split('\n');

hrefList.forEach(href => {
  let line = '3호선';
  let station = '';
  let type = 'subway';
  let abbreviation = '';

  if (href !== '') {
    let decodeUrl = decodeURIComponent(href);
    let targetText = decodeUrl.split('/')[3];
    let textList = targetText.split('-');

    for (let i in textList) {
      if (textList[i].indexOf('역') >= 0) {
        station = textList[i];
        break;
      }
    }
    requestUrl(href, line, station, type, abbreviation);
  }
});

function requestUrl(url, line, station, type, abbreviation) {
  request(url, (err, res, body) => {
    let $ = cheerio.load(body);
    let tables = $('.type01');
    let timeList = [];

    for (let i = 0 ; i < tables.length ; i++) {
      let table = tables.eq(i);
      let day = table.prev().text();
      let dayType = '';
      let thLength = table.children().eq(0).children().eq(0).children().length;

      if (thLength !== 3) continue;

      for (let j in dayList) {
        if (day.indexOf(dayList[j]) < 0) continue;

        dayType = dayTypeList[j];

        let thead = table.children().eq(0).children().eq(0).children();
        let directions = [thead.eq(0).text(), thead.eq(2).text()];
        let timetable = table.children().eq(1).children();
        let timeObject = makeTimeObject(dayType, directions, timetable);

        timeList.push(timeObject);
      }
    }
    createDocuments(line, station, timeList, abbreviation, type);
  });
}

function makeTimeObject(dayType, directions, timetable) {
  let timeObject = {};
  timeObject[dayType] = {};
  timeObject[dayType][directions[0]] = {};
  timeObject[dayType][directions[1]] = {};

  for (let i = 0 ; i < timetable.length ; i++) {
    let tds = timetable.eq(i).children();
    let upTrain = refineMinutes(tds.eq(0).text());
    let time = tds.eq(1).text();
    let downTrain = refineMinutes(tds.eq(2).text());

    timeObject[dayType][directions[0]][time] = upTrain;
    timeObject[dayType][directions[1]][time] = downTrain;
  }
  return timeObject;
}

function refineMinutes(timeText) {
  let list = timeText.split(' ');
  let refineList = [];

  if (timeText === '-') return refineList;

  for (let i = 0 ; i < list.length ; i++) {
    if (i === (list.length - 1)) {
      if (list[i].indexOf('(') < 0) refineList.push([list[i], '-']);
      break;
    }
    if (list[i].indexOf('(') >= 0) continue;
    if (list[i+1].indexOf('(') >= 0) {
      refineList.push([list[i], list[i+1]]);
    } else {
      refineList.push([list[i], '-']);
    }
  }
  return refineList;
}

function createDocuments(line, station, timeTable, abbreviation, type) {
  let item = new Subway();

  item.line = line;
  item.station = station;
  item.timeTable = timeTable;
  item.abbreviation = abbreviation;
  item.type = 'subway';

  item.save(err => {
    if (err) console.error(err);
    console.log(`${line}-${station} create done`);
  })
}
