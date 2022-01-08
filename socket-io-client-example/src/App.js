import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ENDPOINT, socket } from './socket'; // import connected socket
import { socket } from './socket'; // import connected socket

function App() {
  // const [response, setResponse] = useState(-1);
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("red");
  const [room, setRoom] = useState("");
  const [card, setCard] = useState("");
  const [pos, setPos] = useState(-1);

  useEffect(() => {
    // Get the initial state
    // const fetchData = async () => {
    //   const result = await axios(
    //     `${ENDPOINT}/getState`,
    //   );

    //   setResponse(result.data.score);
    // };
    // fetchData();

    // socket.on('update score', data => {
      //   setResponse(data);
      // });
      
    // Listen for socket events
    socket.on('room code', roomCode => {
      console.log("Created room " + roomCode);
      setRoom(roomCode);
    });

    socket.on('room updated', teams => {
      console.log(`Updated teams: ${JSON.stringify(teams)}`);
    });

    socket.on('invalid room', () => {
      console.log(`Cannot join room ${room}: invalid code.`);
    });
    
    socket.on('name exists', () => {
      console.log(`Cannot join room ${room}: name already exists.`);
    });

    socket.on('game updated', state => {
      console.log(`Updated state: ${JSON.stringify(state)}`);
    });

    socket.on('game end', winningTeam => {
      console.log(`Team ${winningTeam} won!`);
    });

    return () => socket.disconnect();
  }, []); // IMPORTANT: DON'T ADD THE MISSING DEPENDENCIES HERE

  // Emit event to the server
  // const scored = () => {
  //   socket.emit('update score');
  // }

  const createRoom = () => {
    socket.emit('create room', name);
  }

  const joinRoom = () => {
    socket.emit('join room', room, name);
  }
  
  const leaveRoom = () => {
    socket.emit('leave room', room, name, teamName);
  }
  
  const joinTeam = (newTeam) => () => {
    setTeamName(newTeam);
    socket.emit('join team', room, name, newTeam);
  }

  const startGame = () => {
    socket.emit('start game', room);
  }

  const removeFromHand = () => {
    socket.emit('remove from hand', room, name, card);
  }

  const placeTile = () => {
    socket.emit('place tile', room, teamName, pos);
  }

  const removeTile = () => {
    socket.emit('remove tile', room, pos);
  }

  const drawCard = () => {
    socket.emit('draw card', room, name);
  }

  return (
    <>
      <p>
        {/* Score: { response }
        <br /> */}
        Name: <input type="text" name="name" onChange={event => setName(event.target.value)} />
        <br />
        Room code: <input type="text" name="roomCode" onChange={event => setRoom(event.target.value)} />
        <br />
        Team name: <input type="text" name="teamName" onChange={event => setTeamName(event.target.value)} />
        <br />
        Card: <input type="text" onChange={event => setCard(event.target.value)} />
        <br />
        Position: <input type="text" onChange={event => setPos(event.target.value)} />
      </p>
      {/* <button onClick={scored}>Scored!</button>
      <br /> */}
      <button onClick={createRoom}>Create room</button>
      <br />
      <button onClick={joinRoom}>Join room</button>
      <br />
      <button onClick={leaveRoom}>Leave room</button>
      <br />
      <button onClick={joinTeam('red')}>Join red team</button>
      <button onClick={joinTeam('blue')}>Join blue team</button>
      <button onClick={joinTeam('green')}>Join green team</button>
      <br />
      <button onClick={startGame}>Start game</button>
      <br />
      <button onClick={removeFromHand}>Remove from hand</button>
      <br />
      <button onClick={placeTile}>Place tile</button>
      <br />
      <button onClick={removeTile}>Remove tile</button>
      <br />
      <button onClick={drawCard}>Draw card</button>
    </>
  );
}

export default App;