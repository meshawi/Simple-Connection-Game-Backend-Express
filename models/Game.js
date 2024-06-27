const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Duration in seconds
  },
  winnerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('lobby', 'started', 'ended'),
    defaultValue: 'lobby'
  },
  paused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pausedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalPausedDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Duration in seconds
  }
});

module.exports = Game;
