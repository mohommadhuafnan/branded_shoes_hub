require('dotenv').config();
const dns = require('node:dns');
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dnsServers = String(process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function run() {
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI (or legacy MONGO_URI)');
  }

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log('Using custom DNS servers:', dnsServers.join(', '));
  }

  await mongoose.connect(mongoUri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    serverSelectionTimeoutMS: 15000,
  });
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log('Pinged MongoDB successfully.');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Mongo ping failed:', error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
