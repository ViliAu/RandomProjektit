const reddit = require('../util/redditapi.js');
const max = 5;

// Reddit JSON body {"kind": "Listing", "data": {"modhash": "", "dist": 0, "children": [], "after": null, "before": null}}))

module.exports = {
    name: 'pawg',
    description: "Displays a pawg",
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
        reddit.getImages(message, amount, true, 'https://www.reddit.com/r/pawg.json');
    }
}