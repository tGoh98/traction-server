// Imports
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import Room from './model/Room.js';
import { removeElem, isEmptyObj } from './model/util.js';


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
let rooms = {};
let socketMap = {};

// Routes
app.get('/', (req, res) => {
  res.send('TRACTION SERVER<br/><i>monotonically increasing</i>');
});

// app.get('/getState', (req, res) => {
//   res.send(state)
// });

function showRoomState() {
  console.log(`Rooms: \n${JSON.stringify(rooms)}`);
}

// Socket
io.on('connection', (socket) => {
  console.log('a user connected');

  function leaveRoom(roomCode, name, teamName) {
    rooms[roomCode].members = removeElem(name, rooms[roomCode].members);
    rooms[roomCode].teams[teamName] = removeElem(name, rooms[roomCode].teams[teamName]);

    socket.leave(roomCode);

    // Delete room if empty
    if (rooms[roomCode].members.length === 0) {
      delete rooms[roomCode];
    }

    showRoomState();
  }
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
    
    // Map must have been updated, i.e. joined/created a room
    if (socket.id in socketMap) {
      let username, roomCode, teamName;
      [username, roomCode, teamName] = socketMap[socket.id];
      // Leave if not in play, or only one member left
      if (rooms[roomCode].gameStage !== 'play' || rooms[roomCode].members.length === 1) {
        leaveRoom(roomCode, username, teamName);
      }
    }
  });

  // Create room
  socket.on('create room', (name) => {
    let roomCode = Room.getNewCode(Object.keys(rooms));
    socket.join(roomCode);
    io.to(roomCode).emit('room code', roomCode);
    rooms[roomCode] = new Room(roomCode, name);
    rooms[roomCode].teams['red'].push(name);
    socketMap[socket.id] = [name, roomCode, 'red'];

    console.log(`Created room ${roomCode} and added user ${name}`);
    showRoomState();
  });

  // Join room
  socket.on('join room', (roomCode, name) => {
    if (!Object.keys(rooms).includes(roomCode)) {
      socket.emit('invalid room');
    } else if (rooms[roomCode].gameStage === 'team') {
      if (rooms[roomCode].members.includes(name)) {
        // We want to allow players to rejoin mid game
        // However, this is slightly insecure because someone else could join midgame under the same name
        // To mitigate it, keep track of people who left mid game
        socket.emit('name exists');
      }
      socket.join(roomCode);
      rooms[roomCode].addMember(name);
      rooms[roomCode].teams['red'].push(name);
      socketMap[socket.id] = [name, roomCode, 'red'];
      io.to(roomCode).emit('room updated', rooms[roomCode].teams);

      console.log(`Joined room ${roomCode} and updated teams`);
      showRoomState();
    } else {
      socket.join(roomCode);

      console.log(`Joined room ${roomCode} mid game as a spectator...or disconnected player who knows O.o`);
      showRoomState();
    }
  });

  // Leave room
  socket.on('leave room', (roomCode, name, teamName) => {
    leaveRoom(roomCode, name, teamName);
  });

  // Join team
  socket.on('join team', (roomCode, name, teamName) => {
    rooms[roomCode].joinTeam(name, teamName);
    socketMap[socket.id][2] = teamName;
    io.to(roomCode).emit('room updated', rooms[roomCode].teams);
    showRoomState();
  });

  // Start game
  socket.on('start game', (roomCode) => {
    rooms[roomCode].setOrder();
    rooms[roomCode].setState();
    rooms[roomCode].gameStage = 'play';

    // Broadcast game updated
    io.to(roomCode).emit('game updated', rooms[roomCode].state);

    showRoomState();
  });

  // Remove card from hand
  socket.on('remove from hand', (roomCode, name, card) => {
    rooms[roomCode].removeFromHand(name, card);
    io.to(roomCode).emit('game updated', rooms[roomCode].state);
    
    showRoomState();
  });

  // Place tile
  socket.on('place tile', (roomCode, teamName, pos) => {
    rooms[roomCode].placeTile(teamName, pos);
    io.to(roomCode).emit('game updated', rooms[roomCode].state);

    // TODO: check win con. update gameStage to 'over' if true
    
    showRoomState();
  });

  // Remove tile
  socket.on('remove tile', (roomCode, pos) => {
    rooms[roomCode].removeTile(pos);
    io.to(roomCode).emit('game updated', rooms[roomCode].state);
    
    showRoomState();
  });

  // Draw card
  socket.on('draw card', (roomCode, name) => {
    rooms[roomCode].drawCard(name);
    io.to(roomCode).emit('game updated', rooms[roomCode].state);
    
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