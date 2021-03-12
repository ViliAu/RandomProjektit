const ytdl = require('ytdl-core');

var queue = [];
var dispatcher = null;
var currentUrl = null;

exports.add = (message, url, showTitle = true, priority = false, seek = 0) => {
    // Check if the requester is even in a voice chat
    if (!message.member.voice.channel) {
        message.reply("You need to be in a voice channel in order to use this command.");
        return;
    }
    if (priority) {
        queue.unshift({url: url, title: showTitle, seek: seek});
        this.skip(null);
    }
    else {
        queue.push({url: url, title: showTitle, seek: seek});
    }

    if (dispatcher != null) {
        if (showTitle) {
            ytdl.getInfo(url).then(info => {
                message.channel.send(info.videoDetails.title + " added to the queue! position: "+queue.length);
            });
        }
        return;
    }

    message.member.voice.channel.join().then(connection => {
        play(message, connection, true);
    }).catch(err => console.log(err));
}

exports.skip = (message) => {
    if (dispatcher != null) {
        if (message != null) {
            message.channel.send("⏭️ "+"<@" + message.author.id + ">"+" Skipped!");
        }
        dispatcher.end();
    }
}

exports.stop = (message) => {
    queue = [];
    if (dispatcher != null) {
        message.channel.send("⏹️ "+"<@" + message.author.id + ">"+" stopped the radio. Sad.");
        dispatcher.end();
    }
}

exports.playing = (message) => {
    if (currentUrl == null) {
        message.channel.send("There's nothing playing!");
        return;
    }
    ytdl.getInfo(currentUrl).then(info => {
        message.channel.send("🎶Currently playing: "+info.videoDetails.title+"🎶");
    });
}

exports.replay = (message) => {
    if (currentUrl == null) {
        message.channel.send("There's nothing playing!");
        return;
    }
    this.add(message, currentUrl, false);
    this.skip(null);
    message.channel.send("🔄 "+"<@" + message.author.id + ">"+" Replayed!");
}

exports.search = async (message, args) => {
    // Parse args
    const query = args.join(' ');

    const video = await yts(query);
    let url = '';
    for (let i = 0; i < 100; i++) {
        if (video.all[i] == null) {
            message.channel.send("Couldn't find a video called \""+query+"\" 😦");
            return;
        }

        if (video.all[i].type === 'video') {
            url = video.all[i].url;
            break;
        }
    }
    this.add(message, url);
}

function play(message, connection) {
    const clip = queue.shift();
    const stream = ytdl(clip.url, { filter: 'audioonly' });
    dispatcher = connection.play(stream, {volume: 1, seek: clip.seek});
    // construct msg
    if (clip.title) {
        ytdl.getInfo(clip.url).then(info => {
            message.channel.send("🎶Now playing: "+info.videoDetails.title+"🎶")
        });
    }
    currentUrl = clip.url;
    dispatcher
    .on("finish", () => {
        currentUrl = null;
        if (queue[0] != null) {
            play(message, connection);
        }
        else {
            dispatcher = null;
            try {
                message.member.voice.channel.leave();
            } catch{}
        }
    });
}

async function sendMessage(url, message) {
    try {
        ytdl.getBasicInfo
        
    }
    catch (e) {
        console.log(e);
    }
}