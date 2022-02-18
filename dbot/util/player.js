const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

var servers = {};

exports.add = async function (message, url, showTitle = true, priority = false, seek = 0, duration = 0, showMsg = true) {
    if (!url) {
        return;
    }
    // Check if the requester is even in a voice chat
    if (!message.member.voice.channel) {
        message.reply("You need to be in a voice channel in order to use this command.");
        return;
    }
    // Chekc if the server has a queue
    if (servers[message.guild.id] == null) {
        servers[message.guild.id] = {
            startTime: 0,
            timerObj: null,
            queue: []
        }
    }
    // Get server instance
    const server = servers[message.guild.id];
    if (!server)
        return;
    if (server.queue == null) {
        server.queue = [];
    }
    // Get video title
    let title = 'Unknown video';
    let length = '??:??';
    try {
        const videoInfo = await ytdl.getInfo(url);
        const divider = (videoInfo.videoDetails.lengthSeconds % 60) < 10 ? ':0' : ':';
        length = `${Math.floor(Number(videoInfo.videoDetails.lengthSeconds / 60))}${divider}${Number(videoInfo.videoDetails.lengthSeconds % 60)}`;
        title = videoInfo.videoDetails.title;
    } catch (err) { console.log(err); }

    // Check priority, priority pushes the req to be first.
    if (server && server.queue) {
        if (priority) {
            if (server.queue.length > 0)
                server.queue[0].seek = Math.round(Date.now() / 1000) - server.startTime;
            server.queue.unshift({ url: url, showTitle: showTitle, seek: seek, title: title, length: length });
            if (server.queue.length > 1)
                server.queue.unshift({ url: url, showTitle: showTitle, seek: seek }); // ehkä fix joskus
            this.skip(message, false);
        }
        else {
            server.queue.push({ url: url, showTitle: showTitle, seek: seek, duration: duration, title: title, length: length });
        }
    }

    if (server.dispatcher != null) {
        if (showMsg) {
            try {
                const info = await ytdl.getInfo(url);
                message.channel.send(`**${info.videoDetails.title}** added to the queue! Position: ***${server.queue.length - 1}***`);
            }
            catch { }
        }
        return;
    }

    try {
        const connection = await message.member.voice.channel.join();
        play(message, connection, server, showMsg); // PUrkka
    }
    catch (err) {
        console.log(err)
    }
}

exports.addPlaylist = async (message, id) => {
    const list = await yts({ listId: id });
    message.channel.send('Adding list ' + list.title + ' to queue.');
    list.videos.forEach(async function (video) {
        await exports.add(message, 'https://www.youtube.com/watch?v=' + video.videoId, true, false, 0, 0, false);
    });
}

exports.skip = (message, reply) => {
    const server = servers[message.guild.id];
    clearTimeout(server.timerObj);
    if (server.dispatcher != null) {
        if (reply) {
            message.channel.send("⏭️ " + "<@" + message.author.id + ">" + " Skipped!");
        }
        server.dispatcher.end();
    }
}

exports.stop = (message) => {
    const server = servers[message.guild.id];
    clearTimeout(server.timerObj);
    if (server.queue != null)
        server.queue = [];
    if (server.dispatcher != null) {
        message.channel.send("⏹️ " + "<@" + message.author.id + ">" + " stopped the radio.");
        server.dispatcher.end();
    }
}

exports.playing = (message) => {
    if (!servers[message.guild.id] || !servers[message.guild.id].queue) {
        return;
    }
    if (servers[message.guild.id].queue[0] == null) {
        message.channel.send("There's nothing playing!");
        return;
    }
    // To prevent errors
    let title = 'a video';
    try {
        title = servers[message.guild.id].queue[0].clip.title;
    }
    catch { }
    message.channel.send(`🎶Currently playing: **${title}**🎶`);
}

exports.replay = (message) => {
    if (servers[message.guild.id].queue[0] == null) {
        message.channel.send("There's nothing playing!");
        return;
    }
    this.add(message, servers[message.guild.id].queue[0].url, false);
    this.skip(null);
    message.channel.send("🔄 " + "<@" + message.author.id + ">" + " Replayed!");
}

exports.search = async function (message, args) {
    // Parse args
    const query = args.join(' ');
    const video = await yts(query);
    let url = '';
    for (let i = 0; i < 100; i++) {
        if (video.all[i] == null) {
            message.channel.send("Couldn't find a video called \"" + query + "\" 😦");
            return;
        }

        if (video.all[i].type === 'video') {
            url = video.all[i].url;
            break;
        }
    }
    exports.add(message, url);
}

exports.queue = function (message) {
    const server = servers[message.guild.id];
    if (server == null || server.queue == null || server.queue.length == 0) {
        message.channel.send("There's nothing on the queue!");
        return;
    }
    let s = '';
    let i = 1;
    for (const o of server.queue) {
        if (s.length > 900) {
            const embed = new Discord.MessageEmbed()
                .addFields({ name: 'Queue', value: s });
            message.channel.send(embed);
            s = ''
        }
        s += `**${i}.** ${o.title} *${o.length}*\n`;
        i++
    }
    const embed = new Discord.MessageEmbed()
        .addFields({ name: 'Queue', value: s });
    message.channel.send(embed);
}

exports.empty = function (message) {
    const server = servers[message.guild.id];
    if (server == null || server.queue.length < 2) {
        message.channel.send("There's nothing to empty!");
        return;
    }
    server.queue.splice(1, server.queue.length - 1);
    message.channel.send("Queue emptied!");
}

async function play(message, connection, server, showMsg) {
    server.startTime = Math.round(Date.now() / 1000);
    const clip = server.queue[0];
    const stream = ytdl(clip.url, { filter: 'audioonly' });
    server.dispatcher = connection.play(stream, { volume: 1, seek: clip.seek });
    // Send msg
    if (clip.showTitle && showMsg) {
        message.channel.send(`🎶Now playing: **${clip.title}**🎶`)
    }

    // Start timer to stop after the duration if duration is set
    server.dispatcher
        .on('start', () => {
            console.log("asd");
            stopAfterDuration(message, clip.duration);
        });

    server.dispatcher
        .on('finish', () => {
            server.queue.shift();
            if (server.queue[0] != null) {
                play(message, connection, server);
            }
            else {
                server.dispatcher = null;
                try {
                    message.member.voice.channel.leave();
                } catch { }
            }
        });
}

function stopAfterDuration(message, dur) {
    const server = servers[message.guild.id]
    if (dur == 0) {
        clearTimeout(server.timerObj);
        return;
    }
    setTimeout(() => {
        exports.skip(message, null)
    }, dur * 1000);
}