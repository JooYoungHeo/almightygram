let cheerio = require('cheerio');
let request = require('request');

let url = 'http://www.findtime.co.kr/3%ED%98%B8%EC%84%A0-%EB%82%A8%EB%B6%80%ED%84%B0%EB%AF%B8%EB%84%90%EC%97%AD-%EC%8B%9C%EA%B0%84%ED%91%9C-%EC%B2%AB%EC%B0%A8%EB%A7%89%EC%B0%A8-%EC%8B%9C%EA%B0%84%ED%8F%AC%ED%95%A8/';

request(url, (err, res, body) => {
  let $ = cheerio.load(body);
  let tables = $('.type01');
  for (let i = 0 ; i < tables.length ; i++) {
    let th = tables.eq(i).children().eq(0).children().eq(0).children().eq(0);
    console.log(th.text());
  }
});
