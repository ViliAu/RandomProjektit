const Discord = require('discord.js');
const fs = require('fs');
const neko = require('./nekoimage.js');
const player = require('./player.js');
const custcmd = require('./customcommand');

const prefix = ('-');

exports.parseCommand = function (client, message) {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'command') {
        custcmd.parseCommand(client, args, message);
        return;
    }

    let cmdFound = false;
    cmdFound = checkCommand(client, message, command, args);
    if (!cmdfound) {
        return;
    }
    // Add command to stats
    
}

function checkCommand(client, message, command, args) {
    cmdFound = checkBasic(client, message, command, args);
    if (cmdFound) return true;
    cmdfound = checkReddit(client, message, command, args);
    if (cmdFound) return true;
    cmdFound = checkImageGen(client, message, command, args);
    if (cmdFound) return true;
    cmdFound = checkSounds(client, message, command, args);
    if (cmdFound) return true;
    cmdFound = checkRadio(message, command, args);
    if (cmdFound) return true;
    cmdFound = checkGames(client, message, command, args);
    if (cmdFound) return true;
    cmdFound = checkMisc(client, message, command, args);
    if (cmdFound) return true;
    // If no command is found, check the custom commands
    cmdFound = custcmd.parseCustomCommand(command, message);
    return cmdFound;
}

function checkBasic(client, message, command, args) {
    switch(command) {
        case 'help':
            client.commands.get('help').execute(message, args);
            break;
        default:
            return false;
    }
    return true;
}

function checkReddit(client, message, command, args) {
    switch(command) {
        case 'meme':
            client.commands.get('meme').execute(message, args);
            break;
        case 'pawg':
            client.commands.get('pawg').execute(message, args);
            break;
        case 'milf':
            client.commands.get('milf').execute(message, args);
            break;
        case 'pvid':
            client.commands.get('pvid').execute(message, args);
            break;
        default:
            return false;
    }
    return true;
}

function checkImageGen(client, message, command, args) {
    switch(command) {
        case 'changemymind':
            client.commands.get('changemymind').execute(message, args);
            break;
        case 'destroy':
            client.commands.get('destroy').execute(message, args);
            break;
        default:
            return false;
    }
    return true;
}

// TEMP TEMP TEMP
function checkSounds(client, message, command, args) {
    switch(command) {
        case 'cheese':
            player.add(message, 'https://www.youtube.com/watch?v=XC3CjYCGEro', false, false, 1.2);
            break;
        case 'nice':
            player.add(message, 'https://www.youtube.com/watch?v=3WAOxKOmR90', false);
            break;
        case 'shaving':
            player.add(message, 'https://www.youtube.com/watch?v=MciqL-IJY5I', false);
            break;
        case 'laser':
            player.add(message, 'https://www.youtube.com/watch?v=KdbI8BwrA1o', false);
            break;
        case 'ian':
            player.add(message, 'https://www.youtube.com/watch?v=mlpYAaS2Efc', false);
            break;
        case 'genius':
            player.add(message, 'https://www.youtube.com/watch?v=5uz1bIV03ng', false);
            break;
        default:
             return false;
    }
    return true;
}

function checkRadio(message, command, args) {
    switch(command) {
        case 'play':
                const regex = /^((http|https)\:\/\/)?(www\.youtube\.com|youtu\.?be)\/(watch\?v\=|).{11}$/;
                // If it's not an url => search for the url
                if (regex.test(args[0])) {
                    console.log("ASD");
                    if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                        message.delete();
                    player.add(message, args[0], true, false)
                }
                else {
                    player.search(message, args, true, false);
                }
            break;
        case 'playing':
            player.playing(message);
            break;
        case 'skip':
            player.skip(message, true);
            break;
        case 'stop':
            player.stop(message);
            break;
        case 'replay':
            player.replay(message);
            break;
        case 'queue':
            player.queue(message);
            break;
        case 'empty':
            player.empty(message);
            break;
        default:
            return false;
    }
    return true;
}

function checkGames(client, message, command, args) {
    switch(command) {
        case 'connect4':
            if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) {
                message.channel.send("I need the permission **Manage messages** to execute that command.");
                return;
            }
            client.commands.get('connect4').execute(message, args);
            break;
        case 'hangman':
            client.commands.get('hangman').execute(message, args);
            if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                message.delete();
            break;
        case 'hm':
            client.commands.get('hangman').execute(message, args);
            if (message.guild.me.hasPermission('MANAGE_MESSAGES'))
                message.delete();
            break;
        default:
            return false;
    }
    return true;
}

function checkMisc(client, message, command, args) {
    switch(command) {
        case 'cunt':
            player.add(message, 'https://www.youtube.com/watch?v=QvM3gY-0YMc', false, true, 7);
            message.channel.send('https://cdn.discordapp.com/attachments/783052027658895360/820038442011852841/images.png');
            break;
        // Neko stuff MOVE ELSEWHERE
        default:
            neko.requestImage(message, command, args);
            return false;
    }
    return true;
}