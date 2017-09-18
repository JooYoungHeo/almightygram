const cheerio = require('cheerio');
const request = require('request');

let domain = 'http://subway.koreatriptips.com/';
let mainPageUrl = `${domain}subway-station.html`;

parsingFirstStep(mainPageUrl).then(result => {
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

function parsingFirstStep(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) reject(err);

      let $ = cheerio.load(body);
      let contentList = $('.content ul li');
      let result = [];

      for (let i = 0 ; i < contentList.length ; i++) {
        let href = contentList.eq(i).find('a').attr('href');
        result.push(href);
      }
      resolve(result);
    });
  });
}

function parsingTwoStep(list) {
  let result = [];
  for (let i in list) {
    result.push(
      new Promise((resolve, reject) => {
        request(`${domain}${list[i]}`, (err, response, body) => {
          if (err) reject(err);
          
          let $ = cheerio.load(body);
          let contentList = $('.content ul li');
          let result2 = [];

          for (let i = 0 ; i < contentList.length ; i++) {
            let href = contentList.eq(i).find('a').attr('href');
            result2.push(href);
          }
          resolve(result2);
        })
      })
    )
  }
  return Promise.all(result);
}
