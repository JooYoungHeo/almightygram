const cheerio = require('cheerio');
const request = require('request');
const path = require('path');

let {Subway} = require(path.join(process.cwd(), 'models'));
let domain = 'http://subway.koreatriptips.com/';
let mainPageUrl = `${domain}subway-station.html`;

parsingUrl(mainPageUrl)
.then(result => parsingTwoStep(result))
.then(result => removeArrayDepth(result))
.then(result => {
  for (let i in result) {
    let url = `${domain}${result[i].href}`;
    let line = result[i].line;
    let station = result[i].station;

    request(url, (err, response, body) => {
      if(err) reject(err);

      let $ = cheerio.load(body);
      let tableList = $('table.table');
      let titleList = $('.box-title');
      let startEndObject = {};
      let upTimetableObject = {};
      let downTimetableObject = {};
      let exitInfoObject = {};
      let busInfoObject = {};

      for (let i = 0 ; i < tableList.length ; i++) {
        let eachTable = tableList.eq(i);
        let title = titleList.eq(i).text();
        let tr = eachTable.find('tr');
        let td = eachTable.find('td');
        let flag = judgeTitle(title);

        if (flag === 0) {
          startEndObject = parsingStartEnd(tr, td);
        } else if (flag === 1) {
          upTimetableObject = parsingTimetable(flag, td);
        } else if (flag === 2) {
          downTimetableObject = parsingTimetable(flag, td);
        } else if (flag === 3) {
          exitInfoObject = parsingInfo(td);
        } else if (flag === 4) {
          busInfoObject = parsingInfo(td);
        }
      }

      createDocuments(line, station, startEndObject, upTimetableObject, downTimetableObject, exitInfoObject, busInfoObject);
    });
  }
}).catch(err => {
  console.error(err);
});

function parsingUrl(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) reject(err);

      let $ = cheerio.load(body);
      let contentList = $('.content ul li');
      let result = [];

      for (let i = 0 ; i < contentList.length ; i++) {
        result.push({
          text: contentList.eq(i).find('a').text(),
          href: contentList.eq(i).find('a').attr('href')
        });
      }
      resolve(result);
    });
  });
}

function parsingTwoStep(list) {
  let result = [];
  for (let i in list) {
    let byLinePageUrl = `${domain}${list[i].href}`;
    result.push(
      Promise.all([
        {line: list[i].text}, parsingUrl(byLinePageUrl)
      ])
    );
  }
  return Promise.all(result);
}

function removeArrayDepth(list) {
  return new Promise((resolve, reject) => {
    let result = [];
    for (let i in list) {
      let infoList = list[i][1];
      for (let j in infoList) {
        result.push({
          line: list[i][0].line,
          station: infoList[j].text,
          href: infoList[j].href
        });
      }
    }
    resolve(result);
  });
}

function judgeTitle(title) {
  return (title.indexOf('첫차') >= 0)? 0: (title.indexOf('상행') >= 0)? 1:
          (title.indexOf('하행') >= 0)? 2: (title.indexOf('출구') >= 0)? 3:
          (title.indexOf('버스노선') >= 0)? 4: 5;

}

function parsingStartEnd(tr, td) {
  let jsonObject = {up: {first: '', last: ''}, down: {first: '', last: ''}};
  for (let i = 0 ; i < tr.length - 1 ; i++) {
    let way = td.eq(3*i).text();
    let first = td.eq(3*i + 1).text();
    let last = td.eq(3*i + 2).text();

    if (judgeTitle(way) === 1) {
      jsonObject.up.first = first;
      jsonObject.up.last = last;
    } else if (judgeTitle(way) === 2) {
      jsonObject.down.first = first;
      jsonObject.down.last = last;
    }
  }
  return jsonObject;
}

function parsingTimetable(flagNumber, td) {
  let jsonObject = (flagNumber === 1)? {up: {}}: {down: {}};
  for (let i = 0 ; i < td.length / 2 ; i++) {
    let time = td.eq(i*2).text();
    let minute = td.eq(i*2 + 1).text();
    if (flagNumber === 1) {
      jsonObject.up[time] = minute.split(',');
    } else {
      jsonObject.down[time] = minute.split(',');
    }
  }
  return jsonObject;
}

function parsingInfo(td) {
  let jsonObject = {};
  for (let i = 0 ; i < td.length / 2 ; i++) {
    let num = td.eq(i*2).text();
    let info = td.eq(i*2 + 1).text();
    jsonObject[num] = info.split(',');
  }
  return jsonObject;
}

function createDocuments(line, station, startEndObj, upObj, downObj, exitObj, busObj) {
  let item = new Subway();
  let date = new Date();
  let weekday = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur'];

  item.date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
  item.day = `${weekday[date.getDay()]}day`;
  item.line = line;
  item.station = station;
  item.upTrain = {
    first: startEndObj.up.first,
    last: startEndObj.up.last,
    timetable: upObj.up
  };
  item.downTrain = {
    first: startEndObj.down.first,
    last: startEndObj.down.last,
    timetable: downObj.down
  };
  item.exitInfo = exitObj;
  item.busInfo = busObj;

  item.save(err => {
    if (err) console.error(err);
  })
}
