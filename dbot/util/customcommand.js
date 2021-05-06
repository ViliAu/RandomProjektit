const dm = require ('./datamanager');
const player = require('./player');
const reddit = require('./redditapi');

// COMMAND STRUCTURE: -command (add) (cheese) (youtube) [content]
exports.parseCommand = function (client, args, message) {
    // Check permission
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.channel.send("You don't have permission to use this command!")
        return;
    }
    // Check what the first arg is (add/del/etc)
    switch (args.shift()) {
        case 'add':
            addCommand(client, args, message);
            break;
        case 'delete':
            deleteCommand(client, args, message);
            break;
        case 'edit':
            editCommand(client, args, message);
            break;
        case 'list':
            listCommands(client, args, message);
            break;
        case 'help':
            message.channel.send("Usage: -command (add/delete/edit/list) (name) (type) (content)");
            break;
        default:
            message.channel.send("No command function found. Try -command help!");
            break;
    }
}

async function addCommand(client, args, message) {
    // Parse args
    if (args.length < 3) {
        message.channel.send("Too few arguments!");
        return;
    }
    const name = args.shift().toLowerCase();
    // Check if the command already exists.
    const cmd = await checkCommand(args[0], message);
    if (cmd) {
        message.channel.send("Command already exists");
        return;
    }

    // Validate command type
    const type = args.shift().toLowerCase();
    if (type !== 'message' && type != 'reddit' && type != 'youtube') {
        message.channel.send("Unknown command type!");
        return;
    }
    // Content (for example yt url)
    const content = args.join(' ');
    try {
        await dm.addCommand(message.guild.id, name, type, content);
        message.channel.send("Command added!");
    }
    catch (err) {
        console.log(err);
        message.channel.send("Couldn't add command!");
    }
}

// Tää ku laitetaa oma komento esim -skönäri
exports.parseCustomCommand = async function (commandString, message) {
    const cmd = await checkCommand(commandString, message);
    if (!cmd) {
        return false;
    }
    switch(cmd.type) {
        case 'message':
            message.channel.send(cmd.content);
            break;
        case 'youtube':
            parseYoutubeCommand(message, cmd.content);
            break;
        case 'reddit':
            reddit.getImages(message, 1, true, 'https://www.reddit.com/r/'+cmd.content+'.json');
            break;
    }
    return true;
}

function parseYoutubeCommand(message, content) {
    const c = content.split(/ +/);
    console.log(c.length);
    switch(c.length) {
        case 1:
            player.add(message, c[0], false, false);
            break;
        case 2:
            player.add(message, c[0], false, false, c[1]);
            break;
        case 3:
            player.add(message, c[0], false, false, c[1], c[2]);
            console.log("yass");
            break;
        default:
            message.channel.send("Too many arguments in the command!");
            break;
    }
}

async function deleteCommand(client, args, message) {
    if (args.length < 1) {
        message.channel.send("Not enough arguments.");
        return;
    }
    try {
        const cmd = await checkCommand(args[0], message);
        if (!cmd) {
            message.channel.send("Command not found.");
            return;
        }
        await dm.deleteCommand(message.guild.id, args[0]);
        message.channel.send("Command deleted.");
    }
    catch {
        message.channel.send("Error occured while deleting command!");
    }
}

// Used to check if a command already exists
async function checkCommand(command, message) {
    let commandObj;
    try {
        // Fetch server command data
        const cmdList = await dm.getServerCommands(message.guild.id);
        // Parse fetched data obj
        for (cmd of cmdList[0].commands) {
            if (cmd.name === command) {
                commandObj = cmd;
                break;
            }
        }
    }
    catch {
        console.log("Collection not found");
    }
    finally {
        console.log(commandObj);
        return commandObj;
    }
}