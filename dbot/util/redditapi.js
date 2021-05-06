const request = require('request');
const Discord = require('discord.js');

const maxFetches = 3;

exports.getImages = (message, amount, nsfw, url) => {
    var fetchAmount = Math.floor(Math.random() * maxFetches) + 1;
    fetch(message, amount, nsfw, url, fetchAmount);
}   

function fetch(message, amount, nsfw, url, fetchAmount, fetchdata = '') {
    fetchAmount--;
    try {
        request.get(`${url}${fetchdata}`, (err, res, body) => {
            let after = JSON.parse(body).data.after;
            if (err != null) {
                console.log(err);
                message.channel.send("Something went wrong while fetching data!");
                return;
            }

            if (fetchAmount > 0) {
                fetch(message, amount, nsfw, url, fetchAmount, '?after=' + after);
                return;
            }
            // Parse the bodyin the same func so no bodies are thrown around
            var urlList = [];
            const commentRegex = /^((http|https)\:\/\/)?(www\.|)reddit.com\/(r\/.*\/comments|gallery)/;
            const imgRegex = /^.+(.jpg|.png|.jpeg)/;

            const data = JSON.parse(body).data.children;
            let index = Math.floor(Math.random() * data.length);
            for (let i = 0; i < amount; i++) {
                // Get rid of comments and dupes
                for (let j = 0; j < 50; j++) {
                    index = Math.floor(Math.random() * data.length);
                    if (urlList.includes(data[index].data.url) || commentRegex.test(data[index].data.url) || (data[index].data.over_18 && !nsfw))
                        continue;
                    else {
                        urlList.push(data[index].data.url);
                        break;
                    }
                }
                var msg = data[index].data.url;
                if (imgRegex.test(data[index].data.url)) {
                    msg = new Discord.MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .setColor('#FF9900')
                    .setTitle(data[index].data.title)
                    .setImage(data[index].data.url)
                    .setFooter('👍 '+data[index].data.ups+'\t💬 '+data[index].data.num_comments);
                }
                message.channel.send(msg);
            }
        });
    }
    catch (e) {
        console.log(e);
    }
}