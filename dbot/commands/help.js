const Discord = require("discord.js")
const neko = require('../util/nekoimage.js');
const db = require ('../util/datamanager.js');

module.exports = {
    name: 'help',
    description: "Displays help",
    async execute(message, args) {
        const necoCMDS = neko.getWhiteList().join(', -');
        const serverCMDS = await getServerCommands(message.guild.id);
        const embed = new Discord.MessageEmbed()
        .addFields(
            { name: 'Translation 📚', value: 'React to a message with the 🇫🇮 or 🇬🇧 emoji to get a translation' },
            { name: 'Regular commands ⚖️', value: '-meme | sends a juicy meme to the channel\n-changemymind [TEXT] | Generates a "Change my mind" meme\n-destroy [TEXT1] ; [TEXT2] | Generates a magnificent piene of art'},
            { name: 'Radio 📻', value: '-play | Adds a clip to the queue\n-skip | Skips the currently playing clip\n-replay | Starts the currently playing song from the beginning\n-playing | Shows the title of the currently playing clip\n-stop | Stops the radio\n-queue | Shows the queue\n-Empty | Empties the queue', inline: false },
            { name: 'Sounds 🎵', value: '-cheese, -nice, -shaving, -laser, -ian', inline: false},
            { name: 'Games 🎮', value: '-connect4, -hangman', inline: false},
            { name: 'Other stuff ♻️', value: '-cunt', inline: false },
        )
        if (serverCMDS != null) {
            embed.fields.push({ name: 'Server commands 🖥️', value: '-'+serverCMDS, inline : false });
        }
        if (message.channel.nsfw) {
            embed.fields.push({ name: 'NSFW stuff 👀', value: '-pawg, -milf, -'+necoCMDS, inline : false });
        }
        if (args[0] === 'extra') {
            embed.fields.push(
                { name: 'Recent updates 🆕', value: 'Multi-server support for the radio!\nAdded a broader search to memes\nConnect 4!\nHangman', inline: false},
                { name: 'Future updates ❔', value: 'Abiliy to add server-sided commands by users\nBetter command parser\nHangman\nCommand stats', inline : false}
            )
        }
        message.channel.send(embed);
    }
}

async function getServerCommands(serverID) {
    const cmds = await db.getServerCommands(serverID);
    let cmdArr = [];
    if (cmds != null && cmds.length > 0) {
        for (o of cmds[0].commands) {
            cmdArr.push(o.name);
        }
    }
    return cmdArr.length > 1 ? cmdArr.join(', -') : null;
}