const { DataTypes } = require('sequelize');
const User = require('./User');
const Game = require('./Game');
const sequelize = require('./index');

const GamePlayers = sequelize.define('GamePlayers', {
  isReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

User.belongsToMany(Game, { through: GamePlayers, as: 'games', foreignKey: 'userId' });
Game.belongsToMany(User, { through: GamePlayers, as: 'players', foreignKey: 'gameId' });

sequelize.sync()
  .then(() => console.log('Database & tables created!'))
  .catch(error => console.log('This error occurred', error));

module.exports = { User, Game, GamePlayers };
