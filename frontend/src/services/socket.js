import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

let socket;

export function initSocket(token) {
    if (socket) return socket;
    socket = io(URL, {
        auth: { token },
        transports: ['websocket']
    });
    socket.on('connect_error', (err) => console.error('Socket connect error', err));
    return socket;
}

export function getSocket() {
    return socket;
}

const socketService = { initSocket, getSocket };
export default socketService;
