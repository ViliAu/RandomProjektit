const Discord = require('discord.js');

// Games are identified by the msg id
var games = {};

const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];

module.exports = {
    name: 'connect4',
    description: 'Connect 4 for DC',
    execute(message, args) {
        newGame(message);
    }
}

function newGame(message) {
    let embed = new Discord.MessageEmbed();
    embed.description = 'Connect 4';
    message.channel.send(embed).then((msg) => {
        games[msg.id] = {
            board: [[0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0], 
                    [0, 0, 0, 0, 0, 0, 0]],
            players: [message.member.user.tag],
            turn: message.member.user.tag
        }
        msg.edit(getEmbed(games[msg.id], '**Waiting for opponent**'));
        msg.react('🎮');
        awaitReactions(msg);
    });
}

async function awaitReactions(msg) {
    const filter = (reaction, user) => {return !user.bot;};
    const collector = msg.createReactionCollector(filter);
    collector.on('collect', (reaction, user) => {
        var game = games[reaction.message.id];
        // If the game hasn't started, assign palyers
        if (game.players.length != 2) {
            if (user.tag === game.players[0]) {
                reaction.users.remove(user);
                return;
            }
            reaction.remove();
            for (r of reactions)
                msg.react(r);
            game.players.push(user.tag);
            msg.edit(getEmbed(game, `${game.turn}'s turn.`));
        }

        // Check that the emoji is appropriate
        let index;
        if ((index = reactions.indexOf(reaction.emoji.toString())) == -1) {
            reaction.remove();
            return;
        }

        // Check that the user who's reacting is appropriate
        if (!game.players.includes(user.tag) || game.turn != user.tag) {
            reaction.users.remove(user);
            return;
        }
        addToken(reaction, index, user, collector, msg);
    });
}

function addToken(reaction, index, user, collector, msg) {
    const game = games[reaction.message.id];
    let y = 0;
    for(let i = 0; i < game.board.length; i++) {
        // Get the lowest pos
        if (game.board[i][index] === 0 && i !== game.board.length-1) {
            continue;
        }
        // Go 1 up
        y = i - (game.board[game.board.length-1][index] === 0 ? 0 : 1) // Bottom check
        game.board[y][index] = (game.turn === game.players[0] ? 1 : 2); // Player turn check
        if (i === 1) {
            reaction.remove();
        }
        break;
    }
    // Check win
    if (checkWin(y, index, game)) {
        msg.edit(getEmbed(game, `${user.tag} won!`));
        reaction.message.reactions.removeAll();
        collector.stop();
        delete games[reaction.message.id];
        return;
    }
    // Check draw
    y = 0;
    for (i in game.board) {
        if (game.board[i].includes(0)) {
            y++;
            break;
        }
    }

    if (y === 0) {
        msg.edit(getEmbed(game, 'It\'s a draw!'));
        reaction.message.reactions.removeAll();
        collector.stop();
        delete games[reaction.message.id];
        return;
    }

    // Continue game
    reaction.users.remove(user);
    game.turn = (game.turn === game.players[0] ? game.players[1] : game.players[0]);
    msg.edit(getEmbed(game, `${game.turn}'s turn.`))
}

function drawboard(game) {
    let bString = '';
    for(i in game.board) {
        for (j in game.board[i]) {
            bString += game.board[i][j] === 0 ? '⚪' : game.board[i][j] === 1 ? '🔴' : game.board[i][j] === 2 ? '🔵' : '🟢';
        }
        bString += '\n';
    }
    return bString;
}

function getEmbed(game, status) {
    return new Discord.MessageEmbed()
    .setTitle("Connect-4")
    .addFields (
        {name: '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣', value: drawboard(game)},
        {name: 'Status', value: status}
    )
}

function checkWin(posY, posX, game) {
    var score = 1;
    //var positions = [{x: 0, y: 0}];
    var contains;
    // Defines orientation (vertical, horizontal...)
    for (let i = 0; i < 4; i++) {
      // Defines direction (up, down...)
      for (let j = 0; j < 2; j++) {
        // Defines the tile we're currently checking
        for (let k = 1; k < 5; k++) {
          // Error prevention for going outside board
          try {
            // change direction if necessary
            let dir = j === 0 ? k : -k;
            // Define the orientation we need to check the tiles
            switch (i) {
              case 0:
                contains = game.board[posY - dir][posX];
                break;
              case 1:
                contains = game.board[posY - dir][posX + dir];
                break;
              case 2:
                contains = game.board[posY][posX + dir];
                break;
              case 3:
                contains = game.board[posY + dir][posX + dir];
                break;
              default:
                break;
            }
          } catch {
            break;
          }
          if (contains === (game.turn === game.players[0] ? 1 : 2)) {
            score++;
          } else {
            break;
          }
        }
      }
      if (score >= 4) {
        return true;
      } else {
        score = 1;
      }
    }
    return false;
  }