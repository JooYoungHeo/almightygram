let cheerio = require('cheerio');
let request = require('request');

let url = 'http://www.findtime.co.kr/3%ED%98%B8%EC%84%A0-%EB%82%A8%EB%B6%80%ED%84%B0%EB%AF%B8%EB%84%90%EC%97%AD-%EC%8B%9C%EA%B0%84%ED%91%9C-%EC%B2%AB%EC%B0%A8%EB%A7%89%EC%B0%A8-%EC%8B%9C%EA%B0%84%ED%8F%AC%ED%95%A8/';

let dayTypeList = ['WD', 'SD', 'HD']; // wd: weekday, sd: saturday, hd: holiday
let dayList = ['평일', '토요일', '일요일'];

let line = '3호선';
let station = '남부터미널역';
let type = 'subway';
let abbreviation = '남터역';

request(url, (err, res, body) => {
  let $ = cheerio.load(body);
  let tables = $('.type01');

  for (let i = 0 ; i < tables.length ; i++) {
    let table = tables.eq(i);
    let day = table.prev().text();
    let dayType = '';
    let thLength = table.children().eq(0).children().eq(0).children().length;

    if (thLength !== 3) continue;

    for (let j in dayList) {
      if (day.indexOf(dayList[j]) < 0) continue;

      dayType = dayTypeList[j];

      let timetable = table.children().eq(1).children().text();


    }
  }
});
