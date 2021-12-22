// Imports
const express = require('express');
const http = require('http');

// CORS
var cors = require('cors')
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

// Init
const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {origin: "*"}
});
app.use(cors(corsOptions));

// Game state
const state = { 'score' : 0 };

// Routes
app.get('/', (req, res) => {
  res.send('TRACTION SERVER<br/><i>monotonically increasing</i>');
});

app.get('/getState', (req, res) => {
  res.send(state)
});

// Socket
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('update score', () => {
    state.score++;
    io.emit('update score', state.score);
  });
});

// Start the server!
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});