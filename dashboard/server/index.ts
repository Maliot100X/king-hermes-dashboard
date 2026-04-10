import { startWebSocketServer } from './websocket';

const PORT = parseInt(process.env.WS_PORT || '8080');

console.log('Starting King Hermes WebSocket Server...');
console.log('Reading REAL data from /proc files...');

startWebSocketServer(PORT);

console.log(`\n✓ WebSocket Server running on ws://localhost:${PORT}`);
console.log('✓ Agents monitored via ps aux');
console.log('✓ CPU from /proc/stat');
console.log('✓ Memory from /proc/meminfo');
console.log('✓ Disk from df -h /');
