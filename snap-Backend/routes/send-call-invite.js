const express = require('express');
const router = express.Router();
const { sendCallInvite } = require('../controllers/sendCallController');

router.post('/send-call-invite', sendCallInvite);

module.exports = router;
