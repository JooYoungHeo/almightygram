const cheerio = require('cheerio');
const request = require('request');

let domain = 'http://subway.koreatriptips.com/';
let mainPageUrl = `${domain}subway-station.html`;

parsingUrl(mainPageUrl).then(result => {
  return parsingTwoStep(result);
}).then(result => {
  let list = [];
  for (let i in result) {
    for (let j in result[i]) {
      list.push(result[i][j]);
    }
  }
  console.log(list);
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
        result.push(contentList.eq(i).find('a').attr('href'));
      }
      resolve(result);
    });
  });
}

function parsingTwoStep(list) {
  let result = [];
  for (let i in list) {
    let byLinePageUrl = `${domain}${list[i]}`;
    result.push(parsingUrl(byLinePageUrl));
  }
  return Promise.all(result);
}
