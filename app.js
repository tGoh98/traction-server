// Imports
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import Room from './model/Room.js';

// CORS
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

// Init
const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {origin: "*"}
});
app.use(cors(corsOptions));

// Game state
const state = { 'score' : 0 };
const rooms = {};

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
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // New room
  socket.on('create room', (name) => {
    let roomCode = Room.getNewCode(Object.keys(rooms));
    socket.join(roomCode);
    io.to(roomCode).emit('room code', roomCode);
    rooms.roomCode = new Room(roomCode, name);
    console.log(`Created room ${roomCode} and added user ${name}`);
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