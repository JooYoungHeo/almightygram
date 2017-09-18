const cheerio = require('cheerio');
const request = require('request');

let domain = 'http://subway.koreatriptips.com/';
let mainPageUrl = `${domain}subway-station.html`;

parsingUrl(mainPageUrl).then(result => {
  let $ = cheerio.load(result);
  let contentList = $('.content ul li');

  for (let i = 0 ; i < contentList.length ; i++) {
    let href = contentList.eq(i).find('a').attr('href');
    console.log(href);
  }
}).catch(err => {
  console.error(err);
});

function parsingUrl(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      err? reject(err): resolve(body);
    });
  });
}
