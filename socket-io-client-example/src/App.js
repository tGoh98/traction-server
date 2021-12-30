import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINT, socket } from './socket'; // import connected socket

function App() {
  const [response, setResponse] = useState(-1);
  const [name, setName] = useState("");

  useEffect(() => {
    // Get the initial state
    const fetchData = async () => {
      const result = await axios(
        `${ENDPOINT}/getState`,
      );

      setResponse(result.data.score);
    };
    fetchData();

    // Listen for socket events
    socket.on('update score', data => {
      setResponse(data);
    });

    socket.on('room code', data => {
      console.log("Created room " + data);
    });

    return () => socket.disconnect();
  }, []);

  // Emit event to the server
  const scored = () => {
    socket.emit('update score');
  }

  const createRoom = () => {
    socket.emit('create room', name);
  }

  return (
    <>
      <p>
        Score: { response }
        <br />
        Name: <input type="text" name="name" onChange={event => setName(event.target.value)} />
      </p>
      <button onClick={scored}>Scored!</button>
      <button onClick={createRoom}>Create room</button>
    </>
  );
}

export default App;