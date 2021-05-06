const {MongoClient} = require('mongodb');
const uri = "mongodb://localhost:27017/epicbot";
const client = new MongoClient(uri, {useUnifiedTopology: true });

var db = null;

exports.find = async function(collection, query = {}) {
    try {
        if (db == null) {
            await connect();
        }
        const items = await db.collection(collection).find(query).toArray();
        return items;
    }
    catch(err) {
        console.log("Search failed!");
        throw err;
    }
}

exports.add = async function(collection, query={}) {
    try {
        if (db == null) {
            await connect();
        }
        await db.collection(collection).insertMany(query);
        console.log(query);
    }
    catch(err) {
        console.log("Adding failed!");
        throw err;
    }
}

exports.update = async function (collection, query={}, values={}) {
    try {
        if (db == null) {
            await connect();
        }
        await db.collection(collection).updateOne(query, values);
    }
    catch(err) {
        console.log("Update failed!");
        throw err;
    }
}


async function connect() {
    try {
        await client.connect();
        db = client.db();
    }
    catch(err) {
        console.log("Couldn't connect to db!");
        throw err;
    }
}