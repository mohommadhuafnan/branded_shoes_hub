const { app, connectToMongo } = require('../server');

module.exports = async (req, res) => {
  await connectToMongo();
  return app(req, res);
};
