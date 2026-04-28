const mongoose = require('mongoose');
require('dotenv').config();

const testURI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!testURI) {
  console.error('FAILED: Missing MONGODB_URI (or legacy MONGO_URI)');
  process.exit(1);
}
console.log('Testing connection to:', testURI.split('@')[1] || testURI); // Hide password

mongoose.connect(testURI)
  .then(() => {
    console.log('SUCCESS: Connection valid!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
