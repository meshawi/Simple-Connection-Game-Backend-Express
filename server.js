const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes'); // New leaderboard routes

app.use(express.json());

require('./models/associations');

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api', leaderboardRoutes); // Use the new leaderboard routes

app.get('/', (req, res) => {
  res.send('Game Backend');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
