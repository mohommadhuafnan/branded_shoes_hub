const dns = require('node:dns');

/**
 * Optional MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 for SRV issues on some networks.
 * Rejects invalid values (e.g. 0.0.0.0/0 is an Atlas IP rule, NOT a DNS server).
 */
function applyMongoDnsFromEnv() {
  const raw = String(process.env.MONGODB_DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      if (s.includes('/')) return false;
      if (s === '0.0.0.0' || s === '::') return false;
      return true;
    });
  if (raw.length > 0) {
    dns.setServers(raw);
    console.log('Using custom DNS servers for MongoDB SRV lookup:', raw.join(', '));
  }
}

module.exports = { applyMongoDnsFromEnv };
