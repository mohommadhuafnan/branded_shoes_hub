const mongoose = require('mongoose');
require('dotenv').config();

const testURI = process.env.MONGO_URI;
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
