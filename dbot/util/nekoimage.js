const request = require('request');
const whitelist = ['pgif', '4k', 'boobs', 'gonewild', 'anal', 'hentai', 'tentacle']
const max = 5;

exports.requestImage = (message, command, args) => {
    // Condition check
    if (!message.channel.nsfw) {
        message.channel.send("You have to send this stuff to a NSFW channel 👀");
        return;
    }
    if (!whitelist.includes(command))
        return;
    amount = 1;
    try {
        amount = parseInt(args);
    } catch {}
    amount = isNaN(amount) ? 1 : amount < 1 ? 1 : amount > max ? max : amount;
    this.getImg(message, command, amount);
}

exports.getImg = async (message, imgtype, amount) => {
    try {
        await request.get(`https://nekobot.xyz/api/image?type=${imgtype}`, (err, res, body) => {
            if (err != null) {
                console.log(err);
            }
            const data = JSON.parse(body).message;
            if (data === 'Unknown Image Type') {
                return;
            }
            message.channel.send(data);
            amount--;
            if (amount > 0) {
                this.getImg(message, imgtype, amount);
            }
        })
    }
    catch (e) {
        console.log(e);
    }
}

exports.getWhiteList = () => {
    return whitelist;
}