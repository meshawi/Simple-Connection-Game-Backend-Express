const express = require('express');
const { createGame, joinGame, startGame, endGame, getGameStats, markAsReady, pauseGame, resumeGame } = require('../controllers/gameController');
const { protect } = require('../controllers/authController');
const router = express.Router();

router.post('/create', protect, createGame);
router.post('/join/:id', protect, joinGame);
router.post('/start/:id', protect, startGame);
router.post('/end/:id', protect, endGame);
router.get('/stats/:id', protect, getGameStats);
router.post('/ready/:id', protect, markAsReady);
router.post('/pause/:id', protect, pauseGame); // New route to pause the game
router.post('/resume/:id', protect, resumeGame); // New route to resume the game

module.exports = router;
