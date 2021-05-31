const express = require('express');
const router = express.Router();
const config = require('../../config');
const appName = config.app.name

router.get('/', (req, res) => {
    res.send(`${appName} server running ..`);
});

module.exports = router;