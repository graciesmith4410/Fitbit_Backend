const express = require('express');
const router = express.Router();
const physicianUser = require("../models/User");

router.get('/', async function(req, res, next) {
    const users = await physicianUser.find();
    res.send(users);
});

module.exports = router;