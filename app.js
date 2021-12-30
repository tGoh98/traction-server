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
// const state = { 'score' : 0 };
const rooms = {};

// Routes
app.get('/', (req, res) => {
  res.send('TRACTION SERVER<br/><i>monotonically increasing</i>');
});

app.get('/getState', (req, res) => {
  res.send(state)
});

function showRoomState() {
  console.log(`Rooms: \n${JSON.stringify(rooms)}`);
}

// Socket
io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Create room
  socket.on('create room', (name) => {
    let roomCode = Room.getNewCode(Object.keys(rooms));
    socket.join(roomCode);
    io.to(roomCode).emit('room code', roomCode);
    rooms[roomCode] = new Room(roomCode, name);
    rooms[roomCode].teams['red'].push(name);

    console.log(`Created room ${roomCode} and added user ${name}`);
    showRoomState();
  });

  // Join room
  socket.on('join room', (roomCode, name) => {
    if (!Object.keys(rooms).includes(roomCode)) {
      socket.emit('invalid room');
    } else if (rooms[roomCode].members.includes(name)) {
      socket.emit('name exists');
    } else {
      socket.join(roomCode);
      rooms[roomCode].addMember(name);
      rooms[roomCode].teams['red'].push(name);
      io.to(roomCode).emit('room updated', rooms[roomCode].teams);

      console.log(`Joined room ${roomCode} and updated teams`);
      showRoomState();
    }
  });

  // Leave room
  socket.on('leave room', (roomCode, name, teamName) => {
    let i = rooms[roomCode].members.indexOf(name);
    if (i > -1) {
      rooms[roomCode].members.splice(i, 1);
    }

    let index = rooms[roomCode].teams[teamName].indexOf(name);
    if (index > -1) {
      rooms[roomCode].teams[teamName].splice(index, 1);
    }

    // TODO: need to update order/state too??
    // perhaps should split team formation and game leave

    socket.leave(roomCode);

    // Delete room if empty
    if (rooms[roomCode].members.length === 0) {
      delete rooms[roomCode];
    }

    showRoomState();
  });

  // Join team
  socket.on('join team', (roomCode, name, teamName) => {
    rooms[roomCode].joinTeam(name, teamName);
    showRoomState();
  });

  // socket.on('update score', () => {
  //   state.score++;
  //   io.emit('update score', state.score);
  // });
});

// Start the server!
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});