const request = require('request');

module.exports = {
    name: 'changemymind',
    description: "Generates a changemymind meme",
    execute(message, args) {
        getImg(message, args.join(' '));
    }
}

async function getImg(message, s) {
    if (s.length === 0) {
        return;
    }
    try {
        await request.get(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${s}`, (err, res, body) => {
            if (err != null) {
                console.log(err);
            }
            const data = JSON.parse(body).message;
            message.channel.send(data);
        })
    }
    catch (e) {
        console.log(e);
    }
}