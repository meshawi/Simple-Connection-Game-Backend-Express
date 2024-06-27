const Game = require('../models/Game');
const User = require('../models/User');
const GamePlayers = require('../models/associations').GamePlayers;
const { Op } = require('sequelize');

exports.createGame = async (req, res) => {
  try {
    const game = await Game.create({ creatorId: req.user.id });
    await game.addPlayer(req.user.id); // Automatically join the creator to the game
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.joinGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.status !== 'lobby') {
      return res.status(400).json({ message: 'Cannot join a game that has already started' });
    }
    await game.addPlayer(req.user.id);
    res.status(200).json({ message: 'Joined game' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.startGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Only the creator can start the game' });
    }
    if (game.status !== 'lobby') {
      return res.status(400).json({ message: 'Game has already started or ended' });
    }

    const players = await GamePlayers.findAll({
      where: { gameId: game.id }
    });

    const allReady = players.every(player => player.isReady);

    if (!allReady) {
      return res.status(400).json({ message: 'All players must be ready to start the game' });
    }

    game.status = 'started';
    game.totalPausedDuration = 0; // Reset paused duration
    await game.save();
    res.status(200).json({ message: 'Game started', game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.endGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Only the creator can end the game' });
    }
    game.ended = true;
    game.status = 'ended';
    game.winnerId = req.body.winnerId;

    const endTime = new Date();
    const startTime = new Date(game.createdAt);
    const actualDuration = Math.floor((endTime - startTime) / 1000);
    game.duration = actualDuration - game.totalPausedDuration; // Subtract paused duration

    await game.save();

    // Update player stats
    const players = await game.getPlayers();
    for (const player of players) {
      player.gamesPlayed += 1;
      if (player.id === req.body.winnerId) {
        player.wins += 1;
      } else {
        player.losses += 1;
      }
      await player.save();
    }

    res.status(200).json({ message: 'Game ended', game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGameStats = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id, {
      include: [{ model: User, as: 'players' }]
    });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsReady = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    const player = await GamePlayers.findOne({
      where: {
        userId: req.user.id,
        gameId: req.params.id
      }
    });
    if (!player) {
      return res.status(404).json({ message: 'Player not found in this game' });
    }
    player.isReady = true;
    await player.save();
    res.status(200).json({ message: 'Player marked as ready', player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.pauseGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Only the creator can pause the game' });
    }
    if (game.status !== 'started') {
      return res.status(400).json({ message: 'Only started games can be paused' });
    }
    game.paused = true;
    game.pausedAt = new Date(); // Track when the game was paused
    await game.save();
    res.status(200).json({ message: 'Game paused', game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resumeGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Only the creator can resume the game' });
    }
    if (!game.paused) {
      return res.status(400).json({ message: 'Only paused games can be resumed' });
    }

    const now = new Date();
    const pausedDuration = Math.floor((now - new Date(game.pausedAt)) / 1000);
    game.totalPausedDuration += pausedDuration; // Update total paused duration

    game.paused = false;
    game.pausedAt = null;
    await game.save();
    res.status(200).json({ message: 'Game resumed', game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
