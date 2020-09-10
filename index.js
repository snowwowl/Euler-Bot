require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
 
const adapter = new FileSync('db.json');
const db = low(adapter);

const http = require('http');

//Save the format of the URL
const mainUrl = 'https://codeforces.com/problemset/problem/';

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

//Object which holds various commands
const settings = {

    commands : {
        add : '.add', //Default is add Code
        createDB : '.ping',
        display : '.display',
        help: '.help',
        delete: '.delete',
    },

    properties: {
        link: 'link',
        code: 'Q',
    }
};

bot.on('message', function(msg) {

  let args = parse(msg.content);

  switch(args[0]) {
    case settings.commands.createDB : createDatabase(msg);
    break;

    case settings.commands.add : add(msg, args);
    break;

    case settings.commands.display : display(msg); 
    break;

    case settings.commands.help : help(msg);
    break;

    case settings.commands.delete : deleteArg(msg, args);
    break;
  }
  
});

function parse(content) {
    let array = content.split(" ");
    return array;
}

function deleteArg(msg, args) {
    msg.reply("Not implemented");
    return;
}

function createDatabase(msg) {
    db.get('users').push({id: msg.author.id, items: []}).write();
    msg.reply(`Your ID is : ${msg.author.id}\nCreated database`);
}

//Used to add Questions
function add(msg, args) {

    const userData = db.get('users').find({id: msg.author.id}).get('items'); 

    if(!userData.value()) {
        msg.reply("You are not registered yet!");
    }
    else if(args.length === 1) {
        msg.reply("Please enter the question code you want to save!");
    }
    else {
        
        let str = "";
        const data = userData.value();

        let flag;

        for(let i in args) {

            //Skip the first iteration
            if(args[i] == settings.commands.add) {
                continue;
            }

            //Search to avoid repetition
            flag = 0;
            for(let j in data) {
                //If found then turn flag to 1 and break
                if(data[j][settings.properties.code] === args[i]) {
                    flag = 1;
                    break;
                }
            }

            //Skip the present iteration
            if(flag === 1) {
                continue;
            }

            //Make an object
            let obj = {};

            obj[settings.properties.code] = args[i];
            obj[settings.properties.link] = `${mainUrl}${parseInt(args[i])}/${args[i][args[i].length - 1]}`;

            //Push it into the database
            userData.push(obj).write();
            str += ` ${args[i]} `;
        }

        //Display a success message
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

        replyDetails(msg, data);
    }
    return;
}

function replyDetails(msg, data) {
    const detailsEmbed = {
        color: 0x0eb335,
        title: 'List of Solved Questions',
        description: `**By ${msg.author}**`,
        fields: [],
        footer: {
            text: 'EulerBot',
        },
    };

    for(let i in data) {
        detailsEmbed.fields.push({
            name: `${Number(i) + 1} . ***${data[i][settings.properties.code]}***`,
            value: `${data[i][settings.properties.link]}`,
        });
    }

    detailsEmbed.fields.push({
        name: '\u200b',
        value: '\u200b',
        inline: false,
    }, {
        name: `Number of Solved Questions`,
        value: `**${data.length}**`,
    });

    msg.reply({ embed: detailsEmbed });

    return;
}

function help(msg) {
    const detailsEmbed = {
        color: 0x0eb335,
        title: 'EulerBot Commands List',
        fields: [{
            name: `${settings.commands.help}`,
            value: `Displays all the commands`,
        }, {
            name: `${settings.commands.createDB}`,
            value: `Creates your Database`,
        }, {
            name: `${settings.commands.add} arg1 arg2 arg3 arg4 ...`,
            value: `Adds all the questions in the databse as specified in the argument list`,
        }],
        footer: {
            text: 'EulerBot',
        },
    };

    msg.channel.send({ embed: detailsEmbed });

    return;
}

bot.login(TOKEN);