let config = require('./config');
let Telebot = require('telebot');
let token = config.telegram.token;

const bot = new Telebot(token);

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();
