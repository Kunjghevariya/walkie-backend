// socketServer.js
import { Server } from 'socket.io';
const users = new Map(); // code => socket.id

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 New socket:', socket.id);

    socket.on('join', ({ code }) => {
      users.set(code, socket.id);
      console.log(`User with code ${code} joined with socket ID: ${socket.id}`);
      socket.data.code = code;
    });

    socket.on('offer', ({ offer }) => {
      const targetSocket = getOtherSocket(socket);
      if (targetSocket) {
        io.to(targetSocket).emit('offer', { offer });
        console.log(`Offer sent to socket ID: ${targetSocket}`);

      }
    });

    socket.on('answer', ({ answer }) => {
      const targetSocket = getOtherSocket(socket);
      if (targetSocket) {
        io.to(targetSocket).emit('answer', { answer });
        console.log(`Answer sent to socket ID: ${targetSocket}`);
      }
    });

    socket.on('candidate', ({ candidate }) => {
      const targetSocket = getOtherSocket(socket);
      if (targetSocket) {
        io.to(targetSocket).emit('candidate', { candidate });
        console.log(`Candidate sent to socket ID: ${targetSocket}`);
      }
    });

    socket.on('disconnect', () => {
      users.delete(socket.data.code);
    });
  });

  function getOtherSocket(currentSocket) {
    const entries = [...users.entries()];
    const currentCode = currentSocket.data.code;
    for (const [code, socketId] of entries) {
      if (code !== currentCode) return socketId;
    }
    return null;
  }
};
