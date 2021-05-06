db = require('./database');

exports.addCommand = async function(serverId, cmdName, type, content) {
    const collection = 'server_commands';
    try {
        const queryAmount = await itemCount(collection, {'server_id': serverId});
        if (queryAmount !== 1) {
            db.add(collection, [{
                'server_id': serverId,
                'commands': []
            }]);
        }
        await db.update(collection,
            {'server_id': serverId},
            {'$push': {
                'commands': {
                    'name': cmdName,
                    'type': type,
                    'content': content }
              }
            });
    }
    catch(err) {
        throw err;
    }
}

exports.deleteCommand = async function(serverId, cmdName) {
    const coll = 'server_commands';
    try {
        await db.update(coll, {'server_id': serverId}, {'$pull': {'commands': {'name': cmdName}}});
    }
    catch(err) {
        throw err;
    }
}

exports.getServerCommands = async function(serverID) {
    const cmdObj = await db.find('server_commands', {'server_id': serverID});
    return cmdObj;
}

async function itemCount(collection, query) {
    try {
        const items = await db.find(collection, query);
        return items.length;
    }
    catch(err) {
        return 0;
    }
}