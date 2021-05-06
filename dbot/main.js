const Discord = require('discord.js');
const fs = require('fs');
const translator = require('./util/translator.js');
const cmdParser = require('./util/commandparser.js');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

setupClient(client);

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
    const langTo = translator.regionalToText(reaction.emoji.toString(), reaction.message.channel);
    if (langTo === '') {
        return;
    }
    let transObj = null;
    // Get the original text to be translated
    let original = reaction.message.author.id === client.user.id ? reaction.message.embeds[0].fields[1].value : reaction.message.content;

    // Try to translate the text
    try {
        transObj = await translator.translateTo(langTo, original);
    }
    catch (e) {
        console.log(e);
        reaction.message.channel.send(user.tag+", I can't translate that...");
    }
    if (!transObj)
        return;
    //let emojiFrom = translator.textToRegional(transObj.from.language.iso);
    try {
        const embed = new Discord.MessageEmbed()
                    .setAuthor(reaction.message.author.tag, reaction.message.author.avatarURL(), reaction.message.url)
                    .setColor('#FF9900')
                    .addField("Original " + translator.textToRegional(transObj.from.language.iso), original)
                    .addField("Translation " + reaction.emoji.toString(), transObj.text)
                    .setFooter("Ordered by "+user.tag, user.avatarURL());
        reaction.message.channel.send(embed);
    } catch(err){console.log(err);}
});

client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }
    cmdParser.parseCommand(client, message);
});

client.login('token');