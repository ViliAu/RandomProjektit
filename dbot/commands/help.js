const Discord = require("discord.js")
const neko = require('../util/nekoimage.js');

module.exports = {
    name: 'help',
    description: "Displays help",
    execute(message) {
        const necoCMDS = neko.getWhiteList().join(', -');

        const embed = new Discord.MessageEmbed()
        .addFields(
            { name: 'Translation 📚', value: 'React to a message with the 🇫🇮 or 🇬🇧 emoji to get a translation' },
            { name: 'Regular commands ⚖️', value: '-meme | sends a juicy meme to the channel\n-changemymind [TEXT] | Generates a "Change my mind" meme\n-destroy [TEXT1] ; [TEXT2] | Generates a magnificent piene of art'},
            { name: 'Radio 📻', value: '-play | Adds a clip to the queue\n-skip | skips the currently playing clip\n-replay | Starts the currently playing song from the beginning\n-playing | Shows the title of the currently playing clip\n-stop | Empties the queue and puts the bot back to sleep', inline: false },
            { name: 'Other stuff ♻️', value: '-shit -cheese -nice -shaving -laser -cunt', inline: false },
            { name: 'NSFW stuff 👀', value: '-pawg, -milf, -'+necoCMDS, inline : false },
        )
        if (!message.channel.nsfw) {
            embed.fields.pop();
        }
        
        message.channel.send(embed);
    }
}