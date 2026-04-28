const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error("Missing MONGODB_URI (or legacy MONGO_URI)");
  process.exit(1);
}

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
