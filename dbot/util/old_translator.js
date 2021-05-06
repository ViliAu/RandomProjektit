const Discord = require('discord.js');
const request = require('request');
const querystring = require('querystring');

exports.translateText = (textToTranslate, from, to, reaction, user) => {
    var form = {
        'action': 'admin_gts_web_translator_translate',
        'params[language_from]': from,
        'params[language_to]': to,
        'params[lang_pair]': from+'_'+to,
        'params[provider]': 'Microsoft',
        'params[input_text]': textToTranslate,
    };
    
    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    
    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        uri: 'http://34.192.174.120/translate.php',
        body: formData,
        method: 'POST'
    },
    (err, res, body) => {
        if (err) {
            console.log(err);
            return;
        }
        translation = JSON.parse(body).data;
        var emojiFrom = reaction.emoji.toString() === "🇬🇧" ?  '🇫🇮' : '🇬🇧';
        var emojiTo = from === 'fi' ? '🇬🇧' : '🇫🇮';
        try {
            var embed = new Discord.MessageEmbed()
                .setAuthor(reaction.message.author.tag, reaction.message.author.avatarURL(), reaction.message.url)
                .setColor('#FF9900')
                .addField("Original " + emojiFrom, textToTranslate)
                .addField("Translation " + emojiTo, translation)
                .setFooter("Ordered by "+user.tag, user.avatarURL());
                reaction.message.channel.send(embed);
        }
        catch(e) {
            return;
        }
    });
}