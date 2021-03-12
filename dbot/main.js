const Discord = require('discord.js');
const fs = require('fs');
const player = require('./util/player.js');
const translator = require('./util/translator.js');
const neko = require('./util/nekoimage.js');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
setupClient(client);
const prefix = '-';

function setupClient(client) {
    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    for (file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
    client.once('ready', () => {
        console.log("TranslateBot ready");
        client.user.setActivity("-help for help!");
    });
}

client.on('messageReactionAdd', async (reaction, user) => {
    // Get reaction data
    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		}
        catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
    // Parse reaction (if not either flag => return)
    if (reaction.emoji.toString() !== "🇫🇮" && reaction.emoji.toString() !== "🇬🇧" || reaction.count !== 1 || (reaction.message.author.bot && reaction.message.author.id != client.user.id)) {
       return;
    }

    var langFrom = reaction.emoji.toString() === "🇬🇧" ?  'fi' : 'en';
    var langTo = langFrom === 'fi' ? 'en' : 'fi';

    try {
        let originalMessage = reaction.message.author.id === client.user.id ? reaction.message.embeds[0].fields[1].value : reaction.message.content;
        translator.translateText(originalMessage, langFrom, langTo, reaction, user);
    }
    catch (e) {
        reaction.channel.send(user.tag+", I can't translate that...");
    }
});

client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    switch (command) {
        case 'help':
            client.commands.get('help').execute(message, args);
            break;
        case 'meme':
            client.commands.get('meme').execute(message, args);
            break;
        case 'pawg':
            client.commands.get('pawg').execute(message, args);
            break;
        case 'milf':
            client.commands.get('milf').execute(message, args);
            break;
        case 'changemymind':
            client.commands.get('changemymind').execute(message, args);
            break;
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
        case 'play':
            if (args[0].split('://')[0] !== 'https')
                player.search(message, args);
            else
                player.add(message, args, true);
            break;
        case 'playing':
            player.playing(message);
            break;
        case 'skip':
            player.skip(message);
            break;
        case 'stop':
            player.stop(message);
            break;
        case 'replay':
            player.replay(message);
            break;
        case 'shit':
            message.channel.send('https://cdn.discordapp.com/attachments/817421041576050767/819686571984945203/download_2.jpg');
            break;    
        case 'destroy':
            client.commands.get('destroy').execute(message, args);
            break;
        case 'cunt':
            player.add(message, 'https://www.youtube.com/watch?v=QvM3gY-0YMc', false, true, 7);
            message.channel.send('https://cdn.discordapp.com/attachments/783052027658895360/820038442011852841/images.png');
            break;
        // Neko stuff
        default:
            neko.requestImage(message, command, args);
            break;
    }   
});

client.login('ODE3NDM4NDM2MTAxMDYyNzI1.YEJg3g.0V8UHspamqqOD9Uh99wYLi3uSUw');