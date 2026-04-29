require('dotenv').config();
const mongoose = require('mongoose');
const { applyMongoDnsFromEnv } = require('../lib/mongoDns');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

/** Prints nested MongoNetworkError text (the generic Atlas message hides the real reason). */
function logPerServerNetworkErrors(err) {
  const top = err?.cause ?? err?.reason;
  const servers = top?.servers;
  if (!servers || typeof servers.forEach !== 'function') return;
  let sawEnoNotFound = false;
  console.error('\nPer-server network errors:');
  servers.forEach((desc, address) => {
    const e = desc.error;
    if (!e) return;
    const list = Array.isArray(e) ? e : [e];
    for (const item of list) {
      const msg = item?.message || String(item);
      if (msg.includes('ENOTFOUND')) sawEnoNotFound = true;
      console.error(`  ${address} → ${msg}`);
    }
  });
  if (sawEnoNotFound) {
    console.error(
      '\nDNS hint: ENOTFOUND on shard hostnames means Windows/your router DNS did not return an A record (MongoDB uses getaddrinfo, not only SRV). Fix: set this PC\'s IPv4 DNS to 8.8.8.8 and 1.1.1.1 (Settings → Network → your adapter → DNS), then run: ipconfig /flushdns\n' +
        'Verify: nslookup <shard-host-from-errors-above> 8.8.8.8 should return an IP; if it does but ping still fails, flush DNS after changing adapter settings.'
    );
  }
}

async function run() {
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI (or legacy MONGO_URI)');
  }

  applyMongoDnsFromEnv();

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
  logPerServerNetworkErrors(error);
  if (error.cause) console.error('Cause:', error.cause);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
