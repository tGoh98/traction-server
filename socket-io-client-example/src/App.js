import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINT, socket } from './socket'; // import connected socket

function App() {
  const [response, setResponse] = useState(-1);

  useEffect(() => {
    // Get the initial state
    const fetchData = async () => {
      const result = await axios(
        `${ENDPOINT}/getState`,
      );

      setResponse(result.data.score);
    };
    fetchData();

    // Connect to the socket
    socket.on('update score', data => {
      setResponse(data);
    });

    return () => socket.disconnect();
  }, []);

  // Emit event to the server
  const scored = () => {
    socket.emit('update score');
  }

  return (
    <>
      <p>
        The score is {response}
      </p>
      <button onClick={scored}>Scored!</button>
    </>
  );
}

export default App;