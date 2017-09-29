let fs = require('fs');
let path = require('path');

let resourceFile = path.join(process.cwd(), '../resource.json');
let resource = JSON.parse(fs.readFileSync(resourceFile));

let config = {telegram: resource.telegram, naver: resource.naver};

module.exports = config;
