const Discord = require("discord.js");
var Jimp = require("jimp");

module.exports = {
    name: 'destroy',
    description: "Test pic",
    async execute(message, args) {
        var caption = ['', ''];
        let index = 0;
        for (let w of args) {
            if (w.trim() === ';' && index === 0) {
                index++;
                continue;
            }
            caption[index] += w;
            caption[index] += ' ';
        }
        if (index === 0) {
            caption[0] = 'Latex';
            caption[1] = 'The person who\n can\'t use this command';
        }
        const path = './images/';
        var fileName = path + 'test.png';
        var loadedImage;

        Jimp.read(fileName)
            .then((image) => {
                loadedImage = image;
                return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
            })
            .then((font) => {
                loadedImage.print(font, 20, 10, {
                    text: caption[0],
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_CENTER}, 100, 50)
                .print(font, 150, 200, {
                    text: caption[1],
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_CENTER}, 100, 100)
                .write(path+'tempgen.png');
            }).then(() => {
                message.channel.send({files:[path+'tempgen.png']});
            })
            .catch(function (err) {
                console.error(err);
            });
    }
}
/*
async function imi(message, fileName, caption, loadedImage, path) {
    Jimp.read(fileName)
            .then((image) => {
                loadedImage = image;
                return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
            })
            .then((font) => {
                loadedImage.print(font, 80, 10, caption[0], 400)
                .print(font, 165, 120, caption[1], 400)
                .write(path+'tempgen.png');
            }).then(() => {
                message.channel.send({files:[path+'tempgen.png']});
            })
            .catch(function (err) {
                console.error(err);
            });
}*/

//HUOMISEKS
/*
image.print(font, pos.x, pos.y, {
    text: "Example test",
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_CENTER
}, pos.maxX, pos.maxY);*/