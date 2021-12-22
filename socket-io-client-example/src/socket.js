// Only need to connect to the socket once
import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

export {
  ENDPOINT,
  socket
}