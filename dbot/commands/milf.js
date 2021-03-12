const request = require('request');
const Discord = require('discord.js');
const max = 5;

module.exports = {
    name: 'milf',
    description: "Displays a MILF",
    execute(message, args) {
        // Condition check
        if (!message.channel.nsfw) {
            message.channel.send("You have to send this stuff to a NSFW channel 👀");
            return;
        }
        var amount = 0;
        try {
            amount = parseInt(args);
        } catch {}
        amount = isNaN(amount) ? 1 : amount < 1 ? 1 : amount > max ? max : amount;
        var memeUrls = [];
        try {
            request.get('https://www.reddit.com/r/milf.json?sort=top&t=week', (err, res, body) => {
                if (err != null) {
                    console.log(err);
                }
                const data = JSON.parse(body).data.children;
                let index = 0;
                for (let i = 0; i < amount; i++) {
                    for (let j = 0; j < 10; j++) {
                        index = Math.floor(Math.random() * data.length);
                        if (memeUrls.includes(data[index].data.url))
                            continue;
                        memeUrls.push(data[index].data.url);
                    }
                    const embed = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .setColor('#FF9900')
                    .setTitle(data[index].data.title)
                    .setImage(data[index].data.url)
                    .setFooter('👍 '+data[index].data.ups+'\t💬 '+data[index].data.num_comments);
                    message.channel.send(embed);
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}