require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
 
const adapter = new FileSync('db.json');
const db = low(adapter);

const http = require('http');
const { create } = require('domain');

http.createServer(function (req, res) {
  res.writeHead(200, {
    'Content-type': 'text/plain'
  });

  res.write('Hey');
  res.end();
}).listen(4000);


db.defaults({users: []}).write();

bot.on('ready', function() {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', function(msg) {

  let args = parser(msg.content);

  switch(args[0]) {
    case "ping" : createDatabase();
    break;

    case ".add" : add(args);
    break;
  }
  
});

function parser(content) {
  let array = content.split(" ");
  return array;
}

function createDatabase() {
  msg.reply("Your ID is: " + msg.author.id)
  db.get('users').push({id: msg.author.id, items: []}).write();
  msg.reply("Created database");
}

function add(args) {
  db.get('users').find({id: msg.author.id}).get('items').push({Q: args[1]}).write();
  msg.reply("Added " + args[1]);
}

bot.login(TOKEN);