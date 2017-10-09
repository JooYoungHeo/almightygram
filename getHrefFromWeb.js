let request = require('request');
let cheerio = require('cheerio');

let line = encodeURIComponent('3호선').toLowerCase();

let hrefList = [];

for (let i = 1 ; i < 100 ; i++) {
  let url = `http://www.findtime.co.kr/page/${i}/?s=3%ED%98%B8%EC%84%A0`;

  requestUrl(url, hrefList).then(result => {
    if (hrefList.length === result.length) return;
    hrefList = result;
  }).catch(err => {
    console.error(err);
  });
}

function requestUrl(url, hrefList) {
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      if (err) reject(err);

      let $ = cheerio.load(body);
      let articles = $('.latestPost');

      for (let i = 0 ; i < articles.length ; i++) {
        let aTag = articles.eq(i).children().eq(0).children().eq(1).children().eq(0);
        let href = aTag.attr('href');

        if (hrefList.indexOf(href) < 0 && href.indexOf(line) >= 0){
          console.log(href);
          hrefList.push(href);
        }
      }
      resolve(hrefList);
    });
  });
}
