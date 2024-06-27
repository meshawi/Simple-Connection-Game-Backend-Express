const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../controllers/authController');
const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
