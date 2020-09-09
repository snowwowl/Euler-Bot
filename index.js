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
    case ".ping" : createDatabase(msg);
    break;

    case ".add" : add(msg, args);
    break;

    case ".display" : display(msg); 
    break;
  }
  
});

function parser(content) {
    let array = content.split(" ");
    return array;
}

function createDatabase(msg) {
    db.get('users').push({id: msg.author.id, items: []}).write();
    msg.reply(`Your ID is : ${msg.author.id}\nCreated database`);
}

function add(msg, args) {

    const userData = db.get('users').find({id: msg.author.id}).get('items'); 

    if(!userData.value()) {
        msg.reply("You are not registered yet!");
    }
    else {

        let str = "";

        for(let i = 1; i < args.length; i++) {
            db.get('users').find({id: msg.author.id}).get('items').push({Q: args[i]}).write();
            str += ` ${args[i]} `;
        }

        msg.reply("Added " + str);
    }

    return;
}

function display(msg) {
    const data = db.get('users').find({id: msg.author.id}).get('items').value();

    if(!data) {
        msg.reply("You are not registered yet!");
    }
    else if(data.length === 0) {
        msg.reply("No Questions, Please Try Some.");
    }
    else {
        let str = "\n";
        for(let i in data) {
            str += `${Number(i) + 1} . ${data[i]['Q']}\n`;
        }

        msg.reply(str);
    }
    return;
}

bot.login(TOKEN);