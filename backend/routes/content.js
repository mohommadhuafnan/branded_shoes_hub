const express = require('express');
const SiteContent = require('../models/SiteContent');

const router = express.Router();

router.get('/', async (_req, res) => {
  let content = await SiteContent.findOne();
  if (!content) content = await SiteContent.create({});
  res.json(content);
});

module.exports = router;
