const Discord = require('discord.js');
const fs = require('fs');
var games = {};

const hangstrings = [
    "`________   \n|/     |   \n|      O   \n|     /|\\  \n|     / \\  \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/     |   \n|      O   \n|     /|\\  \n|     /    \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/     |   \n|      O   \n|     /|\\  \n|          \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/     |   \n|      O   \n|     /|   \n|          \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/     |   \n|      O   \n|      |   \n|          \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/     |   \n|      O   \n|          \n|          \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/     |   \n|          \n|          \n|          \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",

    "`________   \n|/         \n|          \n|          \n|          \n|\\         \n‾‾‾‾‾‾‾‾‾‾‾`",
    
    "`________   \n|/     |   \n|          \n|     \\O/  \n|      |   \n|\\    / \\  \n‾‾‾‾‾‾‾‾‾‾‾`"
]

module.exports = {
    name: 'hangman',
    description: 'Hangman for DC',
    execute(message, args) {
        if (!args[0]) {
            message.channel.send("Type \"-hangman help\" for help!");
            return;
        }
        switch(args[0]) {
            case 'help':
                message.channel.send(new Discord.MessageEmbed().addFields(
                    {name: "Hangman instructions",
                    value: "Start a new game by typing in \"-hangman new\" (or \"-hm new\")followed by a custom word optionally.\n"+
                    "If there's an ongoing game you can guess character or words by\ntyping in \"-hangman\" (or \"-hm\") followed by your guess."})
                );
                break;
            case 'new':
                args.shift();
                newGame(message, args.join(' '));
                break;
            case 'quit':
                quitGame(message);
                break;
            default:
                guess(message, args.join(' '));
                break;
        }
    }
}

function newGame(message, word) {
    word = word.replace('_', '');
    word = word.toLowerCase();
    if (games[message.channel.id]) {
        message.channel.send("There's already an ongoing game.");
        return;
    }
    let embed = new Discord.MessageEmbed();
    embed.description = 'New hangman game';
    if (word.length === 0) {
        fs.readFile('./data/words.json', (err, data) => {
            if (err) {
                console.log(err);
                message.channel.send("Something went wrong!");
            }
            word = JSON.parse(data).words[Math.floor(Math.random() * JSON.parse(data).words.length)];
            message.channel.send(embed).then((msg) => {
                games[msg.channel.id] = {
                    msg: msg,
                    word: word,
                    guessed: [],
                    lives: 7,
                    encrypted: `\`${word.replace(/[^_\s]/g, '_ ')}\``
                }
                msg.edit(getEmbed(games[msg.channel.id]));
            });
        });
    }
    
    else {
        message.channel.send(embed).then((msg) => {
            games[msg.channel.id] = {
                msg: msg,
                word: word,
                guessed: [],
                lives: 7,
                encrypted: `\`${word.replace(/[^_\s]/g, '_ ')}\``
            }
            msg.edit(getEmbed(games[msg.channel.id]));
        });
    }
}


function guess(message, word) {
    word = word.replace('_', '');
    word = word.toLowerCase();
    game = games[message.channel.id];
    if (game == null) {
        message.channel.send("There isn't any ongoing games on this channel.");
        return;
    }
    if (word.length === 0 || game.guessed.includes(word)) {
        return;
    }
    let indexes = [];
    if (word.length === 1)
        indexes = getIndexes(word, game.word)

    if (indexes.length === 0 && word !== game.word) {
        game.lives--;
    }
    else {
        // WIN
        if (indexes.length != 0) {
            game.encrypted = createNewEncrypt(indexes, game);
        }
        if (word === game.word) {
            // Ugly solver...
            indexes = [];
            for (let i = 0; i < game.word.length; i++) {
                indexes.push(i);
            }
            game.encrypted = createNewEncrypt(indexes, game);
        }
        if (!game.encrypted.includes('_')) {
            game.lives = 8;
            game.msg.edit(getEmbed(game));
            delete games[message.channel.id];
            return;
        }
    }
    game.guessed.push(word);
    // LOSE
    if (game.lives == 0) {
        game.msg.edit(getEmbed(game));
        delete games[message.channel.id];
        return;
    }
    game.msg.edit(getEmbed(game));
}

function getIndexes(char, string) {
    let indexes = []
    let i = -1;
    while((i=string.indexOf(char,i+1)) >= 0)
        indexes.push(i);
    return indexes;
}

function createNewEncrypt(indexes, game) {
    let s = '`';
    let j = 0;
    let lastSpace = false;
    for (let i = 1; i < game.encrypted.length; i++) {
        if (game.encrypted.charAt(i) === ' ') {
            if (lastSpace) {
                s+=' ';
                j++;
            }
            lastSpace = !lastSpace;
            continue;
        }
        s += indexes.includes(j) ? game.word.charAt(j) : game.encrypted.charAt(i);
        s += ' ';
        j++;
        lastSpace = false;
    }
    return s;
}

function getEmbed(game) {
    var embed = new Discord.MessageEmbed()
    .addFields (
        {name: 'Hangman', value: hangstrings[game.lives]},
        {name: 'Word', value: game.encrypted},
    );
    if (game.guessed.length > 0) {
        embed.fields.push({name: 'Previous guesses', value: game.guessed.join(', ')});
    }
    if (game.lives === 0) {
        embed.fields.push({name: 'You lost!', value: `The word was **${game.word}**`});
    }
    else if (game.lives === 8) {
        embed.fields.push({name: 'You won!', value: `The word was **${game.word}**`});
    }
    return embed;
}

function quitGame(message) {
    game = games[message.channel.id];
    if (game == null) {
        message.channel.send("There aren't any ongoing games on this channel.");
        return;
    }
    else {
        message.channel.send(`You quit the game. The word was **${game.word}**`);
        delete games[message.channel.id];
        return;
    }
}