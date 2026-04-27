const { MongoClient } = require('mongodb');

// Try with mongodb+srv first, since Node native driver might handle SRV better than Mongoose?
// No, the DNS error was from Node. Let's try the direct mongodb:// string without replicaSet name
const uri = "mongodb://mohommadhuafnan756_db_user:Afnr2424@ac-lvycnv1-shard-00-00.evi0g3u.mongodb.net:27017,ac-lvycnv1-shard-00-01.evi0g3u.mongodb.net:27017,ac-lvycnv1-shard-00-02.evi0g3u.mongodb.net:27017/shoesHubDB?ssl=true&authSource=admin&retryWrites=true&w=majority";

async function run() {
  console.log("Connecting...");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000
  });

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const db = client.db("shoesHubDB");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (error) {
    console.error("Connection Error Details:");
    console.error(error);
  } finally {
    await client.close();
  }
}

run();

run();
