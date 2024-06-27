const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const players = await User.findAll({
      order: [['wins', 'DESC'], ['gamesPlayed', 'ASC']],
      limit: 10
    });
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
