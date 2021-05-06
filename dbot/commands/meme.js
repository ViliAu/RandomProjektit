const reddit = require('../util/redditapi.js');
const max = 5;

module.exports = {
    name: 'meme',
    description: "Displays a meme",
    execute(message, args) {
        // Condition check
        var amount = 0;
        try {
            amount = parseInt(args);
        } catch {}
        amount = isNaN(amount) ? 1 : amount < 1 ? 1 : amount > max ? max : amount;
        reddit.getImages(message, amount, false, 'https://www.reddit.com/r/dankmemes.json');
        
    }
}